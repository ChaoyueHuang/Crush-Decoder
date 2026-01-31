# project_context.md

This file provides guidance to codex when working with code in this repository.

## Project Overview

"Crush Decoder" is a Next.js web application that analyzes social media screenshots (WeChat Moments or Xiaohongshu) to provide personality insights via AI. The app simulates an AI-powered analysis tool with a cyberpunk aesthetic, featuring a freemium model where basic analysis is free and advanced insights require payment. 

Users upload screenshots from social media (WeChat chat records/Moments), and AI conducts visual analysis and psychological profiling, producing a "decoding report" that includes MBTI analysis, core traits, psychological state, potential weaknesses, authenticity assessment, contradiction check, defense mechanism, comparative analysis, and summary&suggestions.

**Key Features:**
- Image upload (up to 6 screenshots)
- Simulated multi-stage analysis process
- Call the AI large model for analysis and return JSON data
- Free personality analysis (MBTI analysis, core traits, psychological state)
- Premium locked sections (potential weaknesses, authenticity assessment, contradiction check, defense mechanism, comparative analysis, summary&suggestions)
- Report download as PNG image
- Payment modal for unlocking premium content

**Important:** This is a **frontend-only prototype** with mock data. There is no actual AI analysis, no backend API, and no real payment processing. All analysis results are hardcoded mock data in `components/crush-decoder/analysis-result.tsx`.

## 数据结构 (JSON Schema)
*Backend 必须返回严格符合此结构的 JSON*：

```json
{
  "is_wechat_or_xiaohongshu": 1,
  "analysis": {
    "conquest_difficulty": {
      "score": 85,
      "ranking": "中等",
      "desc": "有一定挑战性"
    },
    "mbti_profile": {
      "type": "ENFP",
      "name": "竞选者",
      "probability": "75%",
      "secondary_type": "ESFP",
      "secondary_probability": "30%",
      "secondary_name": "竞选者",
      "logic": "E (外向)：极高频的社交展示，婚礼、聚餐、群像徒步，能量来源于人群；N (直觉)：关注'乌托邦'、'Set free'等抽象概念，以及对环保宏大议题的共情，而非单纯记录流水账；F (情感)：情绪外露，开心就发疯，难过就听emo歌，价值观驱动（环保愤怒）；P (感知)：'Random trip'、说走就走的徒步，生活充满了即兴与探索，排版随性不刻板"
    },
    "core_traits": {
      "extroversion": 90,
      "rationality": 40,
      "sensitivity": 85,
      "adventure": 85,
      "romanticism": 80,
      "independence": 75,
      "summary": "TA 是一个热情洋溢、富有创造力的人，善于社交且充满理想主义色彩，内心深处追求自由和真实的情感连接。"
    },
    "psychological_state": {
      "current_state": "间歇性焦虑与持续性自愈的拉锯战。她正处于'痛并快乐着'的真实状态——白天是不得不为了'股票变红'而奋斗的'牛马'，晚上/周末是必须去野外撒野找回灵魂的'自由人'。",
      "deepest_desire": "渴望'有质感的逃离'。她潜意识里想逃离枯燥的世俗工作（工作工作工作），但又迷恋世俗带来的精致消费（新荣记、日本游）。她最想要的是一个能陪她一起'精神私奔'，但在现实中又足够强大能托底的伴侣。"
    },
    "potential_weaknesses": [
      {
        "weakness": "高浓度的情绪依赖",
        "analysis": "她在深夜分享《Set free》和《Greedy》，以及吐槽工作的崩溃瞬间，暴露了她极需情绪出口。一个能精准解读她音乐品味、在她低落时提供'灵魂共鸣'的人，能轻易绕过物质防线攻入内心。"
      },
      {
        "weakness": "文艺青年的'清高'死穴",
        "analysis": "她对环保有激进的态度，对'俗人'（乱扔垃圾、无趣）有天然鄙视。如果一个人把自己包装成'怀才不遇、对抗世俗、热爱自然'的孤独艺术家，会激起她的圣母心和保护欲。"
      },
      {
        "weakness": "年龄与身份的隐形焦虑",
        "analysis": "特意强调'28岁的第一天'，加上对股票和工作的执念，说明她对未来的不确定性有焦虑。能给她提供'确定性'和'安稳感'的成熟男性对她有致命吸引力。"
      }
    ],
    "authenticity_assessment": [
      {
        "score": 95,
        "fishing_risk": "低",
        "persona_check_positive": "几乎无伪造痕迹"
      },
      {
        "score": 95,
        "fishing_risk": "低",
        "persona_check_positive": "虽然有豪车（未直接展示但消费力匹配）、高端局，但同时毫无包袱地展示了零下26度被冻成狗的狼狈、模糊的Live图、以及杂乱的工作吐槽"
      },
      {
        "score": 95,
        "fishing_risk": "低",
        "persona_check_positive": "骗子只会发精修图，不会发自己像个粽子一样在雪地里"
      },
      {
        "score": 95,
        "fishing_risk": "低",
        "persona_check_negative": "部分内容有轻微美化倾向，但在正常范围内"
      }
      
    ],
    "contradiction_check": [
      {
      "name": "独立 vs 依赖",
      "details": "存在'精致中产'与'卑微社畜'的割裂，但这恰恰是真实的铁证。朋友圈里既有'新荣记'的奢华，又有'工作工作'的崩溃。这不叫人设崩塌，这是北京/上海CBD打工人的真实写照——用昂贵的消费来补偿被异化的灵魂",
      "summary": "表面独立，内心渴望被照顾"
    },
    {
      "name": "理性 vs 感性",
      "details": "声称讨厌drama，但对情感内容互动频繁",
      "summary": "情感需求高于表面呈现"
    },
    {
      "name": "社交 vs 独处",
      "details": "频繁晒聚会但也常发独处内容",
      "summary": "需要平衡社交和个人空间"
    }
    ],
    "defense_mechanism": [
      {
        "name": "升华",
        "analysis": "当面对工作的压抑（Id的冲动）时，她没有选择堕落，而是将其转化为社会认可的高级活动——徒步、摄影、出国游。她在朋友圈展示这些，既是给别人看，也是在告诉自己：'虽然我在打工，但我依然拥有只有少数人能理解的精彩生活'，以此来防御平庸感。",
        "suggestion": "先配合她的节奏，建立信任后再尝试深入"
    },
    {
        "name": "忙碌屏障",
        "analysis": "以忙碌为由保持距离",
        "suggestion": "尊重她的时间，但保持稳定的存在感"
    }
    {
        "name": "模糊回应",
        "analysis": "对敏感问题给出模棱两可的回答",
        "suggestion": "不要追问，给她安全的表达空间"
    }
  ],
    "comparative_analysis": {
      "attraction_target": "作为'猎手'，她对'有少年感的精英男'最有杀伤力。这类男性通常有经济基础但生活枯燥，会被她这种'生命力爆棚'且带点文艺范儿的女生深深吸引，觉得她是枯燥生活的解药。",
      "vulnerability_target": "作为'猎物'，她最容易被'高知文艺渣男'收割。这种男人不需要很有钱，只需要懂一点哲学、摄影，带她去个没人知道的野山坡看日落，再表现出一点忧郁，就能让她以为遇到了灵魂伴侣，从而忽略对方现实中的不靠谱。"
    },
    "summary_and_advice": {
      "essence_summary": "她是一位典型的'在一线城市用力生活的体验派女青年'。28岁，有审美洁癖，经济独立，既要在世俗中搞钱（炒股、工作），又要去精神高地吸氧（徒步、手冲咖啡）。她看起来朋友很多，热闹非凡，但内心其实在寻找一个能透过她'现充'的外表，读懂她深夜emo和'乌托邦'梦想的深度伴侣。",
      "suggestions": [
        "切入点要'小众且高级'：别聊大众景点，聊她去的'熊野古道'；别问喝不喝星巴克，回答她'手冲豆子推荐一支带有花香的埃塞俄比亚瑰夏'。用认知差来建立吸引力。",
        "做她的'情绪安全网'：她工作压力大，情绪波动明显。在她吐槽工作或发emo歌时，不要讲大道理，要站在她这边一起吐槽世界，或者给出一个温暖的拥抱（即使是语言上的）。",
        "保持'上进'但'不俗'的人设：她讨厌俗气（如在高原放烟花），但又需要世俗的安全感（股票红）。你需要展示你有稳定的事业，但同时你也是个有趣、有社会责任感的人，而不是满身铜臭味的暴发户。"
      ]
    },
    "final_note": {
      "note": "爱情需要时间培育，真诚是最好的策略。相信自己，也相信缘分。祝你好运！"
    }
  }
}
```

## Technology Stack

- **Framework:** Next.js 16.0.10 (App Router, React Server Components)
- **React:** 19.2.0
- **Styling:** Tailwind CSS 4.1.9 with custom cyberpunk theme
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Fonts:** Orbitron (headings/mono), Inter (body text)
- **Icons:** Lucide React
- **Visualization:** Recharts (personality radar chart)
- **Image Export:** html-to-image (report download)
- **Notifications:** Sonner (toast notifications)
- **Package Manager:** pnpm


## Project Structure

```
crush-decoder-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with fonts and metadata
│   ├── page.tsx                 # Main page with upload flow logic
│   └── globals.css              # Tailwind config and cyberpunk theme
├── components/
│   ├── crush-decoder/           # Feature-specific components
│   │   ├── hero-section.tsx    # Upload area and decode button
│   │   ├── analysis-result.tsx # Results container with all modules
│   │   ├── match-score-card.tsx # Difficulty score gauge
│   │   ├── mbti-card.tsx       # MBTI type analysis
│   │   ├── personality-radar.tsx # Radar chart visualization
│   │   ├── psychology-card.tsx  # Psychological state analysis
│   │   ├── locked-section.tsx   # Premium content overlay
│   │   ├── premium-sections.tsx # All premium analysis modules
│   │   ├── payment-modal.tsx    # Payment UI (mock)
│   │   └── thinking-indicator.tsx # Loading animation
│   └── ui/                      # shadcn/ui components (50+ components)
├── lib/
│   └── utils.ts                 # cn() helper for Tailwind class merging
├── hooks/
│   ├── use-mobile.ts            # Mobile detection hook
│   └── use-toast.ts             # Toast notification hook
├── public/                      # Static assets (icons)
└── styles/
    └── globals.css              # Duplicate of app/globals.css
```

## Key Architecture Patterns

### State Management (app/page.tsx)

The main page manages all application state using React hooks:
- `uploadedImages`: Array of base64 image strings (max 6)
- `isDecoding`: Boolean for loading state
- `decodingStage`: Current stage message during analysis
- `showResult`: Boolean to show/hide analysis results
- `showPaymentModal`: Boolean for payment modal visibility
- `isUnlocked`: Boolean tracking premium content unlock status

### Component Communication

1. **Upload Flow:** `HeroSection` handles file upload → converts to base64 → stores in parent state
2. **Analysis Flow:** Parent triggers 4-stage simulated analysis (1.2s each) → shows results
3. **Unlock Flow:** `AnalysisResult` → triggers parent to show `PaymentModal` → parent sets `isUnlocked`

### Mock Data Pattern

All analysis data is hardcoded in `components/crush-decoder/analysis-result.tsx`:
- `personalityData`: Radar chart values
- `mbtiData`: MBTI type and reasoning
- `psychologyData`: Current state and inner desires
- `premiumData`: All premium section content (weaknesses, authenticity, contradictions, etc.)

**To modify analysis content:** Edit the mock data objects in `analysis-result.tsx`.

### Styling Architecture

**Cyberpunk Dark Theme (Always Dark Mode):**
- Custom color palette in `app/globals.css` using oklch color space
- Three custom neon colors: purple (`--neon-purple`), cyan (`--neon-cyan`), pink (`--neon-pink`)
- Gradient text animation (`.gradient-text`) with 8s color shift
- Glitch effect (`.glitch-text`) with subtle distortion
- Scan line overlay effect on main page

**Tailwind Configuration:**
- Uses Tailwind v4 with CSS-first configuration
- Theme variables defined in `@theme inline` block
- Custom utilities: `gradient-text`, `glitch-text`
- Font variables: `--font-orbitron` (mono), `--font-inter` (sans)

### Image Upload Constraints

- Maximum 6 images
- Accepts any image format
- Converts to base64 for display (stored in state only)
- **No server upload** - images never leave the browser
- Images are reset when user clicks decode or removes them

## Configuration Notes

### next.config.mjs

```javascript
typescript: {
  ignoreBuildErrors: true,  // Allows build with TS errors
}
images: {
  unoptimized: true,  // Disables Next.js Image Optimization
}
```

### Path Aliases

Defined in `components.json` and `tsconfig.json`:
- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/hooks` → `./hooks`
- `@/app` → `./app`

## Common Development Tasks

### Adding New Analysis Modules

1. Create component in `components/crush-decoder/`
2. Add mock data to `analysis-result.tsx`
3. Import and render in `AnalysisResult` component
4. Place in free section (before line 150) or premium section (after line 157)

### Adding New Premium Features

1. Add feature to `features` array in `payment-modal.tsx`
2. Create module component in `premium-sections.tsx`
3. Add mock data to `premiumData` in `analysis-result.tsx`
4. Render conditionally based on `isUnlocked` prop

### Modifying Upload Behavior

- Edit `HeroSection` component in `components/crush-decoder/hero-section.tsx`
- Change `MAX_IMAGES` constant to adjust upload limit
- Modify `handleImagesUpload` callback in `app/page.tsx` for different processing

### Customizing Analysis Stages

Edit `DECODING_STAGES` array in `app/page.tsx`:
```typescript
const DECODING_STAGES = [
  "AI 正在阅读...",
  "正在分析内容...",
  "正在推演心理...",
  "正在生成报告...",
]
```

Change delay in `handleDecode` function (currently 1200ms per stage).

### Styling Adjustments

**To modify theme colors:**
- Edit CSS variables in `app/globals.css` (`:root` and `.dark` sections)
- Neon colors are defined separately: `--neon-purple`, `--neon-cyan`, `--neon-pink`

**To adjust component styling:**
- All components use Tailwind utility classes
- shadcn/ui components can be customized in `components/ui/`
- Use `cn()` helper from `lib/utils.ts` for conditional class merging

## Important Constraints

1. **No Backend Integration:** All functionality is client-side only. To add real AI analysis, you'll need to:
   - Set up API routes in `app/api/`
   - Implement image upload to storage service
   - Integrate AI/ML service for analysis
   - Replace mock data with real API responses

2. **No Real Payment:** `PaymentModal` simulates payment with a 2-second delay. To add real payments:
   - Integrate Stripe, Alipay, or WeChat Pay
   - Add payment verification endpoint
   - Store unlock status in database or session

3. **TypeScript Errors Ignored:** Build configuration ignores TypeScript errors. Consider fixing TS issues before production deployment.

4. **Image Optimization Disabled:** Next.js Image Optimization is disabled. Re-enable for production by removing `images.unoptimized` setting and using `next/image` component.

5. **Client-Side Only:** All components use `"use client"` directive. Consider converting static sections to Server Components for better performance.

## Analytics

Vercel Analytics is integrated in `app/layout.tsx`. Events are automatically tracked for production deployments on Vercel.
