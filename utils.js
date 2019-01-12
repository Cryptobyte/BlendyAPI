const bcrypt = require('bcrypt');

module.exports = {
    sanitize : (user)=>{
        user.password = undefined;
        user.email = undefined;
        return user;
    },
    hash: (password)=>{
        bcrypt.hash(password, 10, (err, hash)=>{
            if(err) return false;
            return hash;
        })
    },
    millis: ()=>{
        return new Date().getTime();
    }
};
