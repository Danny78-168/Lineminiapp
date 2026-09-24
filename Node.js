const express = require('express');
const app = express();
app.use(express.json());

// 模擬資料庫（實際開發請換成你的資料庫，例如 MongoDB、MySQL 或 PostgreSQL）
const usersDB = []; 

// 接收前端 LINE Login / Mini App 授權後的 API 路由
app.post('/api/auth/line-login', async (req, res) => {
  try {
    // 1. 取得前端傳過來的資料
    const { lineUserId, name, avatar, email } = req.body;

    if (!lineUserId) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要的 Line User ID' 
      });
    }

    // 2. 檢查資料庫中是否已經存在該 lineUserId
    let user = usersDB.find(u => u.lineUserId === lineUserId);

    if (!user) {
      // 3. 【新用戶】執行自動註冊與綁定
      user = {
        id: usersDB.length + 1,
        lineUserId,
        name: name || 'LINE 用戶',
        avatar: avatar || '',
        email: email || '',
        createdAt: new Date()
      };
      usersDB.push(user);
      console.log(`[自動註冊成功] 新用戶: ${user.name} (${lineUserId})`);
    } else {
      // 4. 【舊用戶】執行自動登入，順便更新最新頭像或暱稱（選填）
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      console.log(`[自動登入成功] 歡迎回來: ${user.name}`);
    }

    // 5. 產生登入憑證 (JWT Token 或自訂 Session Token)
    // 實務上建議使用 jsonwebtoken 套件來簽發 Token
    const token = "mock_jwt_token_user_" + user.id;

    // 6. 回傳成功狀態與 token 給前端
    return res.status(200).json({
      success: true,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      }
    });

  } catch (err) {
    console.error("處理 LINE 自動登入 API 發生錯誤：", err);
    return res.status(500).json({ 
      success: false, 
      message: '伺服器內部錯誤' 
    });
  }
});

// 啟動伺服器
app.listen(3000, () => {
  console.log('後端 API 伺服器正在執行中，監聽連接埠 3000...');
});
