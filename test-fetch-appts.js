async function testFetch() {
  const userId = 'usr-1788329388225-i15udlv';
  const res = await fetch(`http://localhost:3000/api/appointments/${userId}`);
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Returned appointments:', JSON.stringify(data, null, 2));
}

testFetch();
