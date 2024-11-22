import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import config from "config";
import bcrypt from "bcrypt";
import { makeid } from "../util/index.js";
import { passwordValidator } from "../validators/register.validator.js";

// bu ip'ye göre doğrulama yapılacak (ip değiştiyse doğrulama istenecek) [ek olarak giriş yaptığı cihazın bilgileri de tutulacak ve tüm ip adresleride aynı şekilde]
// Redis ve rabitMQ mantığı kurulacak.
// işlem ekranı olabilir. işlem ekranına girer işlemlerini yapar bir onay istenir, işlemler gerçekleşir işlemlerin tümü tek mailde yollanır.
// Günün ürünü önerisi olacak. Restoranın önerdiği ürün ve ya algoritmanın seçtiği ürünler arasından gösterilecek. (Öneri algoritması) [Kendini nasıl hissediyorsun testi]
// resimler için örnekler olacak. (resimlerin boyutları ve özellikleri)

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 1000,
      max: 32,
    },
    profilePicture: {
      type: String,
      default: "https://ui-avatars.com/api/?name=John+Doe&size=512",
    },
    birthdate: {
      type: Date,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
      default: "İstanbul",
    },
    state: {
      type: String,
      default: "Türkiye",
    },
    postalCode: {
      type: String,
      default: "34000",
    },
    otpActive: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "creator", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = async function (password) {
  if (!password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ id: this._id }, config.get("jwt.secret"), {
    expiresIn: 7 * 24 * 60 * 60 * 100,
  });
  return token;
};

export const User = model("User", userSchema);

export async function pullForum(user, forum) {
  return await User.findOneAndUpdate(
    { _id: user._id },
    { $pull: { forums: forum._id } }
  )
    .then((data) => {
      return { data: data };
    })
    .catch((err) => {
      return { error: err.message };
    });
}

export async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  });
}

export async function getUser(id) {
  return User.findById(id)
    .then((data) => {
      data.populate("companies").exec();
      return { data: data };
    })
    .catch((err) => {
      return { error: err.message };
    });
}

export async function createUser(data) {
  let user = new User(data);
  user.secret = makeid(32);
  return user
    .save()
    .then((data) => {
      return { data: user };
    })
    .catch((err) => {
      return { error: err.message };
    });
}

export async function findUserByName(username) {
  return User.findOne({ username: username })
    .then((user) => {
      return { data: user };
    })
    .catch((err) => {
      return { error: err.message };
    });
}

export async function findUserById(id) {
  return User.findById(id)
    .then((user) => {
      return { data: user };
    })
    .catch((err) => {
      return { error: err.message };
    });
}

export async function findUserByMail(mail) {
  return User.findOne({ email: mail })
    .then((user) => {
      return { data: user };
    })
    .catch((err) => {
      return { error: err.message };
    });
}

export function filterUser(user) {
  const { password, secret, ...personTrimmed } = user;
  return personTrimmed;
}

export async function updateUserPassword(user, newPassword, oldPassword) {
  let result = await user.comparePassword(oldPassword);
  if (result) {
    let value = passwordValidator.validate(newPassword);
    if (value.error) {
      return {
        error: value.error.details[0].message,
      };
    } else {
      return User.findByIdAndUpdate(user._id, {
        password: hashPassword(newPassword),
      })
        .then(() => {
          return {
            data: "Changed Password.",
          };
        })
        .catch((err) => {
          return {
            error: err.message,
          };
        });
    }
  } else {
    return {
      error: "Old password is incorrect",
    };
  }
}

export async function updateUserPasswordWoCom(user, newPassword) {
  let value = passwordValidator.validate(newPassword);
  if (value.error) {
    return {
      error: value.error.details[0].message,
    };
  } else {
    return hashPassword(newPassword).then((x) => {
      return User.findOneAndUpdate({ _id: user._id }, { password: x })
        .then((x) => {
          return {
            data: x,
          };
        })
        .catch((err) => {
          return {
            error: err.message,
          };
        });
    });
  }
}
