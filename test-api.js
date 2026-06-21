fetch("http://localhost:3000/api/products")
  .then(res => res.json())
  .then(json => console.log(JSON.stringify(json, null, 2).slice(0, 500)))
  .catch(err => console.error(err))
