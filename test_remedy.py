import requests

response = requests.post('http://localhost:8000/api/remedy', json={'symptoms': 'fever'})
print(f'Status: {response.status_code}')
data = response.json()
print(f'Response length: {len(data.get("response", ""))} chars')
print('Response preview:')
print(data.get("response", "ERROR")[:500])
