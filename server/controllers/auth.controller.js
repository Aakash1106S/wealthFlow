const crypto = require('crypto');
const User = require('../models/User.model');
const { generateToken } = require('../utils/generateToken');

// ─── REGISTER ──────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password, // hashed in model pre-save hook
      currency: currency || 'INR',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Special auto-creation for demo account on a fresh database
    if (email === 'demo@wealthflow.app') {
      const existingDemo = await User.findOne({ email });
      if (!existingDemo) {
        await User.create({
          name: 'Demo User',
          email: 'demo@wealthflow.app',
          passwordHash: 'Demo@123',
          currency: 'INR',
        });
      }
    }

    // Get user with password
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET ME ────────────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE PROFILE ────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'currency', 'theme', 'accentColor', 'monthlyIncomeGoal', 'avatar'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated!', user });
  } catch (error) {
    next(error);
  }
};

// ─── CHANGE PASSWORD ───────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    next(error);
  }
};

// ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production: send email with resetToken
    // For now, return token in response (remove in production)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log(`Password reset URL: ${resetUrl}`);

    res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' ? { resetUrl } : {}),
    });
  } catch (error) {
    next(error);
  }
};

// ─── RESET PASSWORD ────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.passwordHash = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.json({ success: true, message: 'Password reset successfully!', token: jwtToken });
  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT (client-side only, but we validate token) ─────────────────────
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
