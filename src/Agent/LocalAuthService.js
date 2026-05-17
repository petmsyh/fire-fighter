const { DEFAULT_AGENT_CONFIG, mergeConfig } = require('./config');

class LocalAuthService {
  constructor(options = {}) {
    this.config = mergeConfig(DEFAULT_AGENT_CONFIG, options.config || {});
    this.currentUser = null;
  }

  validateCredentials(username, password) {
    if (!username || !password) {
      return { valid: false, error: 'Username and password are required.' };
    }

    if (
      username.length < this.config.auth.minUsernameLength
      || password.length < this.config.auth.minPasswordLength
    ) {
      return { valid: false, error: 'Username or password is too short.' };
    }

    if (username !== this.config.auth.username || password !== this.config.auth.password) {
      return { valid: false, error: 'Invalid username or password.' };
    }

    return { valid: true, error: null };
  }

  login(username, password) {
    const result = this.validateCredentials(username, password);
    if (!result.valid) {
      return result;
    }

    this.currentUser = { username };
    return { valid: true, user: this.currentUser, error: null };
  }

  logout() {
    this.currentUser = null;
  }

  isAuthenticated() {
    return Boolean(this.currentUser);
  }
}

module.exports = { LocalAuthService };
