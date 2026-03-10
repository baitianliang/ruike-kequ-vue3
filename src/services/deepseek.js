import axios from 'axios'

const DEEPSEEK_API_KEY = '你的_API_密钥' // 替换为你的实际API密钥
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions' // 检查最新的API端点

export default {
  async getCompletion(messages) {
    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: "deepseek-chat", // 或其他可用模型
          messages: messages
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data.choices[0].message.content
    } catch (error) {
      console.error('DeepSeek API 错误:', error)
      return "抱歉，我暂时无法回答这个问题。"
    }
  }
}