module.exports = {
    sanitize : (user)=>{
        user.password = undefined;
        user.email = undefined;
        return user;
    },
    hash: (password)=>{
        return password;
    }
};