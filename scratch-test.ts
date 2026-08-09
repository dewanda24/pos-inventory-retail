async function testVercelLogin() {
  console.log('Sending login request to Vercel...');
  try {
    const response = await fetch('https://pos-inventory-retail.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'owner', password: 'password123' })
    });
    
    console.log(`STATUS: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log('RESPONSE BODY:');
    console.log(text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testVercelLogin();
