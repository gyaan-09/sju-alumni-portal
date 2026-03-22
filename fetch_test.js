fetch('http://localhost:5000/api/alumni')
  .then(r => r.json())
  .then(d => {
      d.forEach(u => {
          if (u.fullName === 'Gyaan Luthria' || u.fullName === 'G L' || u.fullName === 'G N') {
              console.log(u.fullName);
              console.log('Username:', u.username);
              console.log('Password:', u.password);
              console.log('RegNo:', u.registerNumber);
              console.log('---');
          }
      });
  }).catch(e => console.error(e));
