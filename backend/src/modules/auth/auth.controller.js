import * as authService from "./auth.service.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "23505") { // Unique violation
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  // Logout is typically handled on the client side by removing the token.
  // We can just return a success message.
  res.json({ message: "Logged out successfully" });
};
