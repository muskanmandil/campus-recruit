const toSnakeCase = (str) => {
    return str && str.replace(/\s+/g, '_').toLowerCase();
};

module.exports = toSnakeCase;