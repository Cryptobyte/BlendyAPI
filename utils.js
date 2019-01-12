const bcrypt = require('bcrypt');

module.exports = {
    sanitize : (user)=>{
        user.password = undefined;
        user.email = undefined;
        return user;
    },
    hash: (password)=> {
        bcrypt.hash(password, 10, (err, hash)=>{
            if(err) throw err;
            return hash;
        })
    },
    compareHash: (password, hash)=> {
        bcrypt.compare(password, hash, (err, res)=>{
            if(err) throw err;
            return res;
        });
    },
    millis: ()=>{
        return new Date().getTime();
    }
};
