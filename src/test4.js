 var date_expire = new Date(Date.now() + 300000);
 var date_now = new Date(Date.now());
console.log(date_expire.getTime() - date_now.getTime());