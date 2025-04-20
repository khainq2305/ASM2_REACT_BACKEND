const User = require("../../models/Client/userModel");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

class AuthController {
  
  static async register(req, res) {
    try {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại!" });
      }
      const user = await User.create({
        email,
        password,
      });

      res.status(201).json({
        message: "Đăng ký thành công!",
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Email hoặc mật khẩu không chính xác!" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Email hoặc mật khẩu không chính xác!" });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "10h" }
      );

      res.status(200).json({
        message: "Đăng nhập thành công!",
        token,
        user: {
  
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }

  static async googleLogin(req, res) {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: "Thiếu token!" });
  
      // 1. Xác thực token với Google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      const googleId = payload.sub; // ID cố định của Google
  
      // 2. Tìm user theo googleId trước
      let user = await User.findOne({ where: { googleId } });
  
      if (!user) {
        // 3. Nếu chưa có, thử tìm theo email (trường hợp user đã đăng ký local)
        user = await User.findOne({ where: { email: payload.email } });
  
        if (user) {
          // 3a. Nếu tìm được user theo email, cập nhật thêm googleId & avatar
          await user.update({
            googleId,
            avatar: payload.picture,
            // nếu có cột provider:
            // provider: "google",
          });
        } else {
          // 3b. Nếu chưa tồn tại user nào -> tạo mới hoàn toàn
          user = await User.create({
            name: payload.name || payload.email.split("@")[0],
            email: payload.email,
            googleId,
            avatar: payload.picture,
            // provider: "google",
            password: "", // vì dùng OAuth
          });
        }
      }
  
      // 4. Tạo JWT
      const accessToken = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "10s" }
      );
  
      return res.status(200).json({
        message: "Đăng nhập Google thành công!",
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("❌ Lỗi Google Login:", err);
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
  }
  

}

module.exports = AuthController;
