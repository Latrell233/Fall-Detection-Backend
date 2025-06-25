import asyncio
import logging
import os
import json
from datetime import datetime
from typing import List, Dict

from livekit import agents, rtc
from livekit.plugins import openai

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ElderlyCompanionVoiceAgent(agents.VoiceAssistant):
    """老人陪伴聊天的AI语音助手"""
    
    def __init__(self):
        # 从环境变量获取模型配置
        model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo") #gpt-4o-mini
        temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.8"))
        tts_voice = os.getenv("TTS_VOICE", "nova")
        stt_language = os.getenv("STT_LANGUAGE", "zh")
        
        super().__init__(
            vad=openai.VAD(),
            stt=openai.STT(language=stt_language),  # 支持中文语音识别
            llm=openai.LLM(
                model=model_name,
                temperature=temperature,
                system_prompt=(
                    "你是一个专门陪伴老年人聊天的AI助手。你的特点是："
                    "1. 说话温和亲切，就像家人一样"
                    "2. 有耐心，说话速度适中，用词简单易懂"
                    "3. 善于倾听，对老人的话题表现出真诚的兴趣"
                    "4. 可以聊家常、回忆往事、分享生活趣事"
                    "5. 关心老人的身体健康和心情"
                    "6. 不会说教，而是像朋友一样平等交流"
                    "请用温暖、耐心的语调与老人对话，让他们感到被关心和陪伴。"
                )
            ),
            tts=openai.TTS(voice=tts_voice),
        )
        
        # 记录当前配置到日志
        logger.info(f"AI模型配置: {model_name}, 温度: {temperature}, 语音: {tts_voice}, 语言: {stt_language}")
        self.conversation_history: List[Dict[str, str]] = []
        self.session_start_time = datetime.now()
        
    async def entrypoint(self, ctx: agents.JobContext):
        """Agent入口点"""
        await ctx.connect(auto_subscribe=agents.AutoSubscribe.AUDIO_ONLY)
        
        # 监听房间事件
        self._setup_room_listeners(ctx.room)
        
        # 记录会话开始
        self._add_to_conversation("system", f"会话开始于 {self.session_start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 欢迎用户
        welcome_msg = "您好！我是您的聊天伙伴，很高兴和您聊天。您今天怎么样？有什么想聊的吗？"
        await self.say(welcome_msg, allow_interruptions=True)
        self._add_to_conversation("assistant", welcome_msg)
        
        # 启动对话循环
        async with self.chat_ctx:
            await self._handle_conversation(ctx)
    
    def _setup_room_listeners(self, room: rtc.Room):
        """设置房间事件监听器"""
        
        @room.on("participant_connected")
        def on_participant_connected(participant: rtc.RemoteParticipant):
            logger.info(f"参与者加入: {participant.identity}")
            self._add_to_conversation("system", f"用户 {participant.identity} 加入对话")
            
        @room.on("participant_disconnected")
        def on_participant_disconnected(participant: rtc.RemoteParticipant):
            logger.info(f"参与者离开: {participant.identity}")
            self._add_to_conversation("system", f"用户 {participant.identity} 离开对话")
            # 用户离开时保存对话记录
            asyncio.create_task(self._save_conversation_to_file())
    
    def _add_to_conversation(self, role: str, content: str):
        """添加对话记录到内存"""
        self.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "role": role,
            "content": content
        })
    
    async def _handle_conversation(self, ctx: agents.JobContext):
        """处理对话逻辑"""
        async for user_msg in self.chat_ctx.aiter():
            try:
                # 记录用户消息
                self._add_to_conversation("user", user_msg.content)
                logger.info(f"用户说: {user_msg.content}")
                
                # 生成AI回复
                assistant_msg = await self.chat_ctx.send_text(user_msg.content)
                
                # 记录AI回复
                self._add_to_conversation("assistant", assistant_msg.content)
                logger.info(f"AI回复: {assistant_msg.content}")
                
            except Exception as e:
                error_msg = "抱歉，我刚才没听清楚，您能再说一遍吗？"
                logger.error(f"处理对话时出错: {e}")
                await self.say(error_msg)
                self._add_to_conversation("assistant", error_msg)
    
    async def _save_conversation_to_file(self):
        """保存对话记录到JSON文件"""
        try:
            # 创建保存目录
            save_dir = "/app/conversations"
            os.makedirs(save_dir, exist_ok=True)
            
            # 生成文件名（基于会话开始时间）
            filename = f"conversation_{self.session_start_time.strftime('%Y%m%d_%H%M%S')}.json"
            filepath = os.path.join(save_dir, filename)
            
            # 添加会话结束记录
            self._add_to_conversation("system", f"会话结束于 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # 准备保存的数据
            conversation_data = {
                "session_info": {
                    "start_time": self.session_start_time.isoformat(),
                    "end_time": datetime.now().isoformat(),
                    "duration_minutes": round((datetime.now() - self.session_start_time).total_seconds() / 60, 2),
                    "total_messages": len([msg for msg in self.conversation_history if msg["role"] in ["user", "assistant"]])
                },
                "conversation": self.conversation_history
            }
            
            # 保存到文件
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(conversation_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"对话记录已保存到: {filepath}")
            
        except Exception as e:
            logger.error(f"保存对话记录到文件失败: {e}")

async def main():
    """主函数"""
    logger.info("启动老人陪伴语音助手...")
    
    # 从环境变量获取配置
    livekit_url = os.getenv("LIVEKIT_URL", "ws://livekit-server:7880")
    livekit_api_key = os.getenv("LIVEKIT_API_KEY")
    livekit_api_secret = os.getenv("LIVEKIT_API_SECRET")
    
    if not all([livekit_api_key, livekit_api_secret]):
        logger.error("缺少必要的LiveKit API配置")
        return
    
    # 创建并启动Agent Worker
    worker = agents.Worker(
        entrypoint_fnc=ElderlyCompanionVoiceAgent().entrypoint,
        request_fnc=agents.llm.LLMFunction(),
        prewarm_fnc=None,
    )
    
    await worker.astart(
        url=livekit_url,
        api_key=livekit_api_key,
        api_secret=livekit_api_secret,
    )

if __name__ == "__main__":
    asyncio.run(main()) 