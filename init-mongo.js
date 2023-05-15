db.createUser({
  user: 'admin',
  pwd: '123456',
  roles: [
    {
      role: 'readWrite',
      db: 'main-database',
    },
  ],
});
db.createCollection('admin');
