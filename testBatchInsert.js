const axios = require('axios')

// 產生假資料函式
function generateFakeUsers (num = 100) {
  const grades = ['110', '111', '112', '113']
  const users = []
  for (let i = 1; i <= num; i++) {
    const grade = grades[i % grades.length]
    users.push({
      account: `student${String(i).padStart(3, '0')}`,
      password: 'password123',
      grade,
      role: 'user',
    })
  }
  return users
}

async function testBatchInsert () {
  const users = generateFakeUsers(50) // 產生 50 筆假資料
  const apiUrl = 'http://localhost:3000/user/batch' // <- 改成你的 API 路徑

  try {
    const response = await axios.post(apiUrl, { users })
    console.log('新增結果:', response.data)
  } catch (error) {
    if (error.response) {
      console.error('API 回傳錯誤:', error.response.status, error.response.statusText)
      console.error('錯誤內容:', error.response.data)
    } else if (error.request) {
      console.error('沒有收到回應，request:', error.request)
    } else {
      console.error('請求錯誤:', error.message)
    }
  }
}

testBatchInsert()
