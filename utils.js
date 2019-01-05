module.exports = {
    sanitize : (user)=>{
        user.password = undefined;
        user.email = undefined;
        return user;
    },
    hash: (password)=>{
        //todo - africa
        return password;
    },
    millis: ()=>{
        return new Date().getTime();
    }
};