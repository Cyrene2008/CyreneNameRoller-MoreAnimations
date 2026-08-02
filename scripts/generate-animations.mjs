import fs from 'node:fs/promises'
import path from 'node:path'

const outFile = path.resolve(import.meta.dirname, '..', 'animations', 'signature.json')
const ease = {
  smooth: 'cubic-bezier(.22,1,.36,1)',
  spring: 'cubic-bezier(.16,1.18,.28,1)',
  dramatic: 'cubic-bezier(.12,.82,.18,1)',
  soft: 'cubic-bezier(.3,.8,.25,1)',
  snap: 'cubic-bezier(.2,1.35,.35,1)',
  exit: 'cubic-bezier(.55,0,1,.45)'
}

const animation = (keyframes, duration = 620, easing = ease.smooth, extra = {}) => ({
  keyframes,
  options: { duration, easing, ...extra }
})

function pagePreset(id, label, description, enterTransform, leaveTransform, options = {}) {
  const duration = options.duration || 460
  const filter = options.filter || 'blur(5px)'
  const overshoot = options.overshoot || 'translateX(0) scale(1)'
  const frames = direction => animation([
    { opacity: 0, transform: direction === 'forward' ? enterTransform : enterTransform.replace(/translateX\(([-\d.]+)([^)]*)\)/, (_, value, unit) => `translateX(${-Number(value)}${unit})`), filter },
    { opacity: 1, transform: overshoot, filter: 'blur(0px)' }
  ], duration, options.easing || ease.smooth)
  const exits = direction => animation([
    { opacity: 1, transform: 'translateX(0) scale(1)', filter: 'blur(0px)' },
    { opacity: 0, transform: direction === 'forward' ? leaveTransform : leaveTransform.replace(/translateX\(([-\d.]+)([^)]*)\)/, (_, value, unit) => `translateX(${-Number(value)}${unit})`), filter: options.exitFilter || 'blur(3px)' }
  ], Math.max(260, duration - 120), ease.exit)
  return {
    id, target: 'page.transition', label, description, tags: ['page', 'non-linear'],
    variants: {
      'forward.enter': frames('forward'),
      'forward.leave': exits('forward'),
      'back.enter': frames('back'),
      'back.leave': exits('back')
    }
  }
}

const simplePreset = (id, target, label, description, keyframes, duration, easing = ease.spring, tags = []) => ({
  id, target, label, description, tags: [target.split('.')[0], 'non-linear', ...tags],
  animation: animation(keyframes, duration, easing)
})

const gsapAnimation = (from, to, duration = 720, easing = 'power3.out', extra = {}) => ({
  gsap: { from, to, options: { duration, ease: easing, ...extra } }
})

const gsapPreset = (id, target, label, description, from, to, duration, easing, tags = [], extra = {}) => ({
  id, target, label, description, tags: [target.split('.')[0], 'gsap', 'non-linear', ...tags],
  animation: gsapAnimation(from, to, duration, easing, extra)
})

function gsapPagePreset(id, label, description, variants) {
  return {
    id, target: 'page.transition', label, description, tags: ['page', 'gsap', 'non-linear'],
    variants: Object.fromEntries(Object.entries(variants).map(([variant, definition]) => [variant, gsapAnimation(...definition)]))
  }
}

const presets = [
  pagePreset('silk-slide', '丝绸滑移', '柔和景深与轻微缩放组成的顺滑页面过渡。', 'translateX(52px) scale(.965)', 'translateX(-30px) scale(.982)', { duration: 480 }),
  pagePreset('depth-portal', '景深门廊', '以透视感和快速聚焦完成空间切换。', 'translateX(38px) scale(.9) rotateY(-4deg)', 'translateX(-24px) scale(1.035) rotateY(2deg)', { duration: 540, filter: 'blur(9px) brightness(1.15)', easing: ease.dramatic }),
  pagePreset('prism-sweep', '棱镜掠影', '轻量色彩与剪裁感的现代切页效果。', 'translateX(46px) skewX(-3deg) scale(.97)', 'translateX(-28px) skewX(2deg) scale(.985)', { duration: 500, filter: 'blur(4px) saturate(1.4)' }),
  pagePreset('soft-orbit', '柔性环绕', '小角度旋转与弹性落位，活泼但不喧闹。', 'translateX(34px) translateY(12px) rotate(1.8deg) scale(.95)', 'translateX(-22px) translateY(-8px) rotate(-1deg) scale(.98)', { duration: 560, easing: ease.spring }),
  pagePreset('glass-focus', '玻璃聚焦', '由朦胧玻璃质感迅速聚焦到正文。', 'translateX(28px) scale(1.025)', 'translateX(-20px) scale(.985)', { duration: 470, filter: 'blur(12px) brightness(1.18)', exitFilter: 'blur(8px)' }),
  pagePreset('elastic-drift', '弹性漂移', '克制的弹性位移，适合连续浏览多个页面。', 'translateX(58px) scale(.94)', 'translateX(-34px) scale(.975)', { duration: 590, easing: ease.snap, overshoot: 'translateX(0) scale(1)' }),
  gsapPagePreset('cinematic-curtain', '电影幕切', '以方向感明确的剪裁幕布和景深完成页面交接。', {
    'forward.enter': [{ opacity: 0, x: 56, clipPath: 'inset(0 100% 0 0 round 18px)', filter: 'blur(8px)' }, { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0 round 0px)', filter: 'blur(0px)' }, 640, 'expo.out'],
    'forward.leave': [{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0 round 0px)' }, { opacity: 0, x: -34, clipPath: 'inset(0 0 0 78% round 18px)' }, 420, 'power3.in'],
    'back.enter': [{ opacity: 0, x: -56, clipPath: 'inset(0 0 0 100% round 18px)', filter: 'blur(8px)' }, { opacity: 1, x: 0, clipPath: 'inset(0 0 0 0% round 0px)', filter: 'blur(0px)' }, 640, 'expo.out'],
    'back.leave': [{ opacity: 1, x: 0, clipPath: 'inset(0 0 0 0% round 0px)' }, { opacity: 0, x: 34, clipPath: 'inset(0 78% 0 0 round 18px)' }, 420, 'power3.in']
  }),
  gsapPagePreset('elastic-depth', '弹性纵深', '以明显的纵深压缩和回弹构成空间感强烈的切页。', {
    'forward.enter': [{ opacity: 0, x: 72, scale: 0.74, rotationY: -9, filter: 'blur(12px)' }, { opacity: 1, x: 0, scale: 1, rotationY: 0, filter: 'blur(0px)' }, 760, 'elastic.out(1,0.42)'],
    'forward.leave': [{ opacity: 1, x: 0, scale: 1, rotationY: 0 }, { opacity: 0, x: -38, scale: 1.08, rotationY: 5, filter: 'blur(5px)' }, 440, 'power3.in'],
    'back.enter': [{ opacity: 0, x: -72, scale: 0.74, rotationY: 9, filter: 'blur(12px)' }, { opacity: 1, x: 0, scale: 1, rotationY: 0, filter: 'blur(0px)' }, 760, 'elastic.out(1,0.42)'],
    'back.leave': [{ opacity: 1, x: 0, scale: 1, rotationY: 0 }, { opacity: 0, x: 38, scale: 1.08, rotationY: -5, filter: 'blur(5px)' }, 440, 'power3.in']
  }),
  gsapPagePreset('gallery-hinge', '画廊铰链', '页面围绕侧边轴心翻入，像展板切换般清晰利落。', {
    'forward.enter': [{ opacity: 0, xPercent: 12, rotationY: -18, scale: 0.92, transformOrigin: '0% 50%', filter: 'blur(6px)' }, { opacity: 1, xPercent: 0, rotationY: 0, scale: 1, transformOrigin: '0% 50%', filter: 'blur(0px)' }, 680, 'back.out(1.45)'],
    'forward.leave': [{ opacity: 1, xPercent: 0, rotationY: 0, transformOrigin: '100% 50%' }, { opacity: 0, xPercent: -8, rotationY: 13, transformOrigin: '100% 50%', filter: 'blur(4px)' }, 430, 'power2.in'],
    'back.enter': [{ opacity: 0, xPercent: -12, rotationY: 18, scale: 0.92, transformOrigin: '100% 50%', filter: 'blur(6px)' }, { opacity: 1, xPercent: 0, rotationY: 0, scale: 1, transformOrigin: '100% 50%', filter: 'blur(0px)' }, 680, 'back.out(1.45)'],
    'back.leave': [{ opacity: 1, xPercent: 0, rotationY: 0, transformOrigin: '0% 50%' }, { opacity: 0, xPercent: 8, rotationY: -13, transformOrigin: '0% 50%', filter: 'blur(4px)' }, 430, 'power2.in']
  }),

  simplePreset('halo-bloom', 'roller.finish', '光环绽放', '结果从柔光中轻微弹跳并稳定落位。', [
    { opacity: 0, transform: 'scale(.72)', filter: 'blur(9px) brightness(1.8)', textShadow: '0 0 0 rgba(255,255,255,0)' },
    { opacity: 1, transform: 'scale(1.09)', filter: 'blur(0px) brightness(1.2)', textShadow: '0 0 34px currentColor', offset: .68 },
    { opacity: 1, transform: 'scale(1)', filter: 'blur(0px) brightness(1)', textShadow: '0 0 0 rgba(255,255,255,0)' }
  ], 720),
  simplePreset('spring-crown', 'roller.finish', '冠冕弹跳', '上扬、回弹与细微旋转构成高级强调。', [
    { opacity: 0, transform: 'translateY(24px) scale(.78) rotate(-1.6deg)', filter: 'blur(6px)' },
    { opacity: 1, transform: 'translateY(-7px) scale(1.075) rotate(.6deg)', filter: 'blur(0px)', offset: .62 },
    { opacity: 1, transform: 'translateY(0) scale(1) rotate(0deg)' }
  ], 760, ease.snap),
  simplePreset('chroma-pulse', 'roller.finish', '虹彩脉冲', '短促色彩增强与聚焦脉冲，不使用线性闪烁。', [
    { opacity: 0, transform: 'scale(.86)', filter: 'blur(7px) saturate(1.9) hue-rotate(-12deg)' },
    { opacity: 1, transform: 'scale(1.06)', filter: 'blur(0px) saturate(1.45) hue-rotate(8deg)', offset: .58 },
    { opacity: 1, transform: 'scale(1)', filter: 'saturate(1) hue-rotate(0deg)' }
  ], 690, ease.dramatic),
  simplePreset('spotlight-lift', 'roller.finish', '聚光升格', '像舞台聚光般从下方升起并收束。', [
    { opacity: 0, transform: 'translateY(30px) scale(.9)', filter: 'brightness(2.2) blur(8px)' },
    { opacity: 1, transform: 'translateY(-5px) scale(1.045)', filter: 'brightness(1.25) blur(0px)', offset: .7 },
    { transform: 'translateY(0) scale(1)', filter: 'brightness(1)' }
  ], 740, ease.dramatic),
  simplePreset('orbit-settle', 'roller.finish', '轨道落位', '沿短弧线进入并以柔和惯性稳定。', [
    { opacity: 0, transform: 'translateX(-24px) translateY(18px) rotate(-3deg) scale(.84)', filter: 'blur(5px)' },
    { opacity: 1, transform: 'translateX(5px) translateY(-4px) rotate(.8deg) scale(1.045)', filter: 'blur(0px)', offset: .66 },
    { transform: 'translateX(0) translateY(0) rotate(0deg) scale(1)' }
  ], 780, ease.spring),
  simplePreset('crystalline-pop', 'roller.finish', '晶体聚合', '剪裁轮廓、锐化与弹性缩放营造晶体聚合感。', [
    { opacity: 0, transform: 'scale(.68) rotate(-1deg)', filter: 'blur(10px) contrast(1.5)', clipPath: 'inset(42% 18% 42% 18% round 20px)' },
    { opacity: 1, transform: 'scale(1.08) rotate(.3deg)', filter: 'blur(0px) contrast(1.12)', clipPath: 'inset(0% 0% 0% 0% round 0px)', offset: .7 },
    { transform: 'scale(1)', filter: 'contrast(1)' }
  ], 820, ease.snap),
  gsapPreset('magnetic-lock', 'roller.finish', '磁场锁定', '结果从侧下方被磁场迅速吸附，并以弹性惯性锁定。', { opacity: 0, x: -54, y: 34, scale: 0.68, rotation: -5, filter: 'blur(10px)' }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, filter: 'blur(0px)' }, 820, 'elastic.out(1,0.32)', ['magnetic']),
  gsapPreset('royal-orbit', 'roller.finish', '皇家环落', '结果沿短弧旋入并以克制回弹落在视觉中心。', { opacity: 0, x: 62, y: -34, scale: 0.72, rotation: 9, filter: 'blur(8px) brightness(1.5)' }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, filter: 'blur(0px) brightness(1)' }, 900, 'back.out(1.9)', ['orbit']),
  gsapPreset('spotlight-condense', 'roller.finish', '聚光凝结', '高亮失焦的结果从远处收束，并带有明显的纵深聚焦。', { opacity: 0, y: 42, scale: 1.28, rotationX: -10, filter: 'blur(16px) brightness(2.4)' }, { opacity: 1, y: 0, scale: 1, rotationX: 0, filter: 'blur(0px) brightness(1)' }, 780, 'expo.out', ['spotlight']),

  simplePreset('cascade-float', 'card.deal', '层叠浮现', '卡片以轻盈的层叠浮动进入牌桌。', [{ opacity: 0, transform: 'translateY(48px) rotateX(8deg) scale(.88)', filter: 'blur(5px)' }, { opacity: 1, transform: 'translateY(-5px) rotateX(-1deg) scale(1.035)', filter: 'blur(0px)', offset: .7 }, { transform: 'translateY(0) rotateX(0deg) scale(1)' }], 680),
  simplePreset('fan-arrival', 'card.deal', '扇面入场', '小角度侧旋像展开纸牌般进入。', [{ opacity: 0, transform: 'translateX(-38px) translateY(22px) rotate(-7deg) scale(.9)' }, { opacity: 1, transform: 'translateX(4px) translateY(-3px) rotate(1.2deg) scale(1.025)', offset: .72 }, { transform: 'translateX(0) translateY(0) rotate(0deg) scale(1)' }], 700, ease.spring),
  simplePreset('velvet-drop', 'card.deal', '天鹅绒落牌', '低速下落与柔焦带来沉稳质感。', [{ opacity: 0, transform: 'translateY(-42px) scale(.94)', filter: 'blur(8px) brightness(1.12)' }, { opacity: 1, transform: 'translateY(5px) scale(1.02)', filter: 'blur(0px)', offset: .7 }, { transform: 'translateY(0) scale(1)' }], 760, ease.soft),
  simplePreset('perspective-dock', 'card.deal', '透视停靠', '从轻微透视角度快速停靠到牌桌。', [{ opacity: 0, transform: 'translateX(44px) rotateY(-12deg) scale(.84)', filter: 'blur(5px)' }, { opacity: 1, transform: 'translateX(-4px) rotateY(2deg) scale(1.035)', filter: 'blur(0px)', offset: .67 }, { transform: 'translateX(0) rotateY(0deg) scale(1)' }], 720, ease.dramatic),
  simplePreset('feather-landing', 'card.deal', '羽落停驻', '缓慢漂移后轻柔落位，适合较少卡片。', [{ opacity: 0, transform: 'translateX(20px) translateY(-34px) rotate(4deg) scale(.92)' }, { opacity: 1, transform: 'translateX(-4px) translateY(4px) rotate(-.8deg) scale(1.018)', offset: .74 }, { transform: 'translateX(0) translateY(0) rotate(0deg) scale(1)' }], 820, ease.soft),
  simplePreset('magnetic-snap', 'card.deal', '磁吸归位', '快速接近并以磁吸般的回弹停下。', [{ opacity: 0, transform: 'translateY(58px) scale(.76)', filter: 'blur(3px)' }, { opacity: 1, transform: 'translateY(-8px) scale(1.06)', filter: 'blur(0px)', offset: .6 }, { transform: 'translateY(0) scale(1)' }], 620, ease.snap),
  gsapPreset('spring-vault-deal', 'card.deal', '弹簧跃牌', '卡片从牌桌下方跃入，围绕底边完成有重量感的回弹。', { opacity: 0, y: 78, scale: 0.66, rotationX: -24, transformOrigin: '50% 100%', filter: 'blur(7px)' }, { opacity: 1, y: 0, scale: 1, rotationX: 0, transformOrigin: '50% 100%', filter: 'blur(0px)' }, 760, 'elastic.out(1,0.38)', ['vault']),
  gsapPreset('dealer-fan', 'card.deal', '荷官扇发', '明显的侧向位移与扇形旋转，模拟荷官快速发牌。', { opacity: 0, x: -82, y: 24, scale: 0.8, rotation: -14, transformOrigin: '0% 100%' }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, transformOrigin: '50% 50%' }, 690, 'back.out(1.7)', ['fan']),
  gsapPreset('ceiling-drop', 'card.deal', '穹顶落牌', '卡片从上方透视落下，以轻微前倾完成停靠。', { opacity: 0, y: -74, scale: 1.12, rotationX: 20, filter: 'blur(9px)', transformOrigin: '50% 0%' }, { opacity: 1, y: 0, scale: 1, rotationX: 0, filter: 'blur(0px)', transformOrigin: '50% 50%' }, 740, 'expo.out', ['depth']),

  simplePreset('hinge-reveal', 'card.flip', '铰链揭晓', '围绕轻微侧轴的空间翻转强调。', [{ transform: 'rotateY(-8deg) scale(.94)', filter: 'brightness(1.35)' }, { transform: 'rotateY(5deg) scale(1.055)', filter: 'brightness(1.12)', offset: .62 }, { transform: 'rotateY(0deg) scale(1)', filter: 'brightness(1)' }], 660, ease.spring),
  simplePreset('prism-flip', 'card.flip', '棱镜翻光', '翻牌瞬间加入克制的色彩折射。', [{ transform: 'scale(.9) rotateZ(-1.5deg)', filter: 'blur(4px) saturate(1.8) hue-rotate(-18deg)' }, { transform: 'scale(1.06) rotateZ(.7deg)', filter: 'blur(0px) saturate(1.35) hue-rotate(10deg)', offset: .64 }, { transform: 'scale(1) rotateZ(0deg)', filter: 'saturate(1) hue-rotate(0deg)' }], 700, ease.dramatic),
  simplePreset('corkscrew', 'card.flip', '丝带旋身', '小幅旋转与纵向回弹形成丝带般的揭晓。', [{ transform: 'translateY(18px) rotate(-5deg) scale(.86)', opacity: .35 }, { transform: 'translateY(-5px) rotate(1.5deg) scale(1.045)', opacity: 1, offset: .68 }, { transform: 'translateY(0) rotate(0deg) scale(1)' }], 740, ease.snap),
  simplePreset('soft-vault', 'card.flip', '柔性跃迁', '卡片整体轻跃并在结果出现后稳定。', [{ transform: 'translateY(14px) scale(.92)', filter: 'blur(3px)' }, { transform: 'translateY(-10px) scale(1.045)', filter: 'blur(0px)', offset: .58 }, { transform: 'translateY(0) scale(1)' }], 680, ease.spring),
  simplePreset('luminous-turn', 'card.flip', '流光转面', '亮度光晕沿翻牌过程收束。', [{ transform: 'scale(.9)', filter: 'brightness(1.8) blur(5px)', boxShadow: '0 0 0 rgba(255,255,255,0)' }, { transform: 'scale(1.055)', filter: 'brightness(1.18) blur(0px)', boxShadow: '0 0 36px rgba(255,255,255,.32)', offset: .62 }, { transform: 'scale(1)', filter: 'brightness(1)', boxShadow: '0 0 0 rgba(255,255,255,0)' }], 720, ease.dramatic),
  simplePreset('elastic-turn', 'card.flip', '弹性转场', '强调回弹速度感，同时保持卡面易读。', [{ transform: 'scale(.82) rotate(2deg)', opacity: .5 }, { transform: 'scale(1.08) rotate(-.8deg)', opacity: 1, offset: .56 }, { transform: 'scale(.985) rotate(.2deg)', offset: .82 }, { transform: 'scale(1) rotate(0deg)' }], 760, ease.snap),
  gsapPreset('axis-reveal', 'card.flip', '轴心翻面', '围绕纵轴进行清晰的 3D 揭晓，结束时带轻微回弹。', { opacity: 0.35, rotationY: -82, scale: 0.82, transformOrigin: '50% 50%', filter: 'brightness(1.7)' }, { opacity: 1, rotationY: 0, scale: 1, transformOrigin: '50% 50%', filter: 'brightness(1)' }, 720, 'back.out(1.6)', ['3d']),
  gsapPreset('paper-hinge', 'card.flip', '纸页铰翻', '卡面像纸页从上沿翻开，具有鲜明的空间层次。', { opacity: 0.4, y: -18, rotationX: -68, scale: 0.9, transformOrigin: '50% 0%', filter: 'blur(5px)' }, { opacity: 1, y: 0, rotationX: 0, scale: 1, transformOrigin: '50% 0%', filter: 'blur(0px)' }, 760, 'elastic.out(1,0.44)', ['hinge']),
  gsapPreset('focus-snap', 'card.flip', '焦点咬合', '从极小焦点迅速扩张并咬合到卡面，节奏紧凑有力。', { opacity: 0, scale: 0.54, rotation: 5, filter: 'blur(13px) contrast(1.6)' }, { opacity: 1, scale: 1, rotation: 0, filter: 'blur(0px) contrast(1)' }, 640, 'expo.out', ['focus']),

  simplePreset('jackpot-bloom', 'lottery.finish', '大奖绽放', '抽奖结果以庆典式光晕和弹跳揭晓。', [{ opacity: 0, transform: 'scale(.68) translateY(18px)', filter: 'blur(10px) brightness(2.2)' }, { opacity: 1, transform: 'scale(1.1) translateY(-5px)', filter: 'blur(0px) brightness(1.25)', textShadow: '0 0 38px currentColor', offset: .66 }, { transform: 'scale(1) translateY(0)', filter: 'brightness(1)', textShadow: '0 0 0 rgba(255,255,255,0)' }], 820, ease.snap),
  simplePreset('aurora-reveal', 'lottery.finish', '极光揭晓', '色彩流转后聚焦到最终奖品。', [{ opacity: 0, transform: 'scale(.82)', filter: 'blur(9px) saturate(1.9) hue-rotate(-20deg)' }, { opacity: 1, transform: 'scale(1.065)', filter: 'blur(0px) saturate(1.5) hue-rotate(14deg)', offset: .62 }, { transform: 'scale(1)', filter: 'saturate(1) hue-rotate(0deg)' }], 860, ease.dramatic),
  simplePreset('comet-arrival', 'lottery.finish', '彗星抵达', '从侧上方快速掠入并柔和停驻。', [{ opacity: 0, transform: 'translateX(48px) translateY(-24px) scale(.78) rotate(2deg)', filter: 'blur(8px)' }, { opacity: 1, transform: 'translateX(-6px) translateY(4px) scale(1.055) rotate(-.5deg)', filter: 'blur(0px)', offset: .68 }, { transform: 'translateX(0) translateY(0) scale(1) rotate(0deg)' }], 780, ease.spring),
  simplePreset('prestige-rise', 'lottery.finish', '典藏升格', '沉稳上升、短暂停驻，再以高级感收束。', [{ opacity: 0, transform: 'translateY(34px) scale(.88)', filter: 'blur(6px) contrast(1.25)' }, { opacity: 1, transform: 'translateY(-7px) scale(1.045)', filter: 'blur(0px) contrast(1.08)', offset: .7 }, { transform: 'translateY(0) scale(1)', filter: 'contrast(1)' }], 840, ease.soft),
  simplePreset('radiant-focus', 'lottery.finish', '辉光聚焦', '从高亮失焦快速凝聚成清晰结果。', [{ opacity: 0, transform: 'scale(1.16)', filter: 'blur(15px) brightness(2.4)' }, { opacity: 1, transform: 'scale(.975)', filter: 'blur(0px) brightness(1.12)', offset: .68 }, { transform: 'scale(1)', filter: 'brightness(1)' }], 760, ease.dramatic),
  simplePreset('constellation-pop', 'lottery.finish', '星群跃现', '清脆弹跳配合柔和阴影扩散。', [{ opacity: 0, transform: 'scale(.64) rotate(-1.2deg)', textShadow: '0 0 0 currentColor' }, { opacity: 1, transform: 'scale(1.12) rotate(.4deg)', textShadow: '0 0 42px currentColor', offset: .58 }, { transform: 'scale(.98) rotate(0deg)', textShadow: '0 0 12px currentColor', offset: .82 }, { transform: 'scale(1)', textShadow: '0 0 0 rgba(255,255,255,0)' }], 880, ease.snap),
  gsapPreset('prize-pedestal', 'lottery.finish', '奖台升格', '奖品从下方奖台般升起，并以厚重回弹完成揭晓。', { opacity: 0, y: 84, scale: 0.62, rotationX: -18, transformOrigin: '50% 100%', filter: 'blur(12px) brightness(1.8)' }, { opacity: 1, y: 0, scale: 1, rotationX: 0, transformOrigin: '50% 100%', filter: 'blur(0px) brightness(1)' }, 920, 'elastic.out(1,0.36)', ['pedestal']),
  gsapPreset('comet-lock', 'lottery.finish', '彗星锁奖', '结果从右上方高速掠入，在中心急停并锁定。', { opacity: 0, x: 86, y: -52, scale: 0.64, rotation: 8, filter: 'blur(14px) brightness(2.1)' }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, filter: 'blur(0px) brightness(1)' }, 760, 'back.out(2.2)', ['comet']),
  gsapPreset('crown-radiance', 'lottery.finish', '冠光降临', '结果以纵深旋转和强光凝聚，形成典礼式揭晓。', { opacity: 0, y: 38, scale: 0.5, rotationX: -22, filter: 'blur(15px) brightness(2.6)', textShadow: '0 0 54px currentColor' }, { opacity: 1, y: 0, scale: 1, rotationX: 0, filter: 'blur(0px) brightness(1)', textShadow: '0 0 0 rgba(255,255,255,0)' }, 880, 'expo.out', ['ceremony']),

  simplePreset('ambient-pulse', 'global.transition', '环境脉冲', '一次克制的径向光晕脉冲。', [{ opacity: 0, transform: 'scale(.82)', background: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,.2), transparent 58%)' }, { opacity: .7, transform: 'scale(1.06)', offset: .46 }, { opacity: 0, transform: 'scale(1.18)' }], 780, ease.dramatic, ['ambient']),
  simplePreset('aurora-breath', 'global.transition', '极光呼吸', '柔和双色极光短暂掠过背景。', [{ opacity: 0, filter: 'blur(22px) saturate(1.2)', background: 'radial-gradient(ellipse at 20% 30%, rgba(92,180,255,.22), transparent 48%), radial-gradient(ellipse at 80% 65%, rgba(255,100,190,.2), transparent 52%)' }, { opacity: .78, filter: 'blur(9px) saturate(1.45)', offset: .5 }, { opacity: 0, filter: 'blur(18px) saturate(1)' }], 1100, ease.soft, ['aurora']),
  simplePreset('ribbon-sweep', 'global.transition', '流光横扫', '细腻斜向光带快速扫过画面。', [{ opacity: 0, transform: 'translateX(-55%) skewX(-14deg)', background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.18) 48%, rgba(255,150,220,.2) 52%, transparent 65%)' }, { opacity: .8, transform: 'translateX(0) skewX(-14deg)', offset: .45 }, { opacity: 0, transform: 'translateX(55%) skewX(-14deg)' }], 900, ease.smooth, ['ribbon']),
  simplePreset('radial-bloom', 'global.transition', '径向绽放', '从结果区域扩散的柔和圆形能量。', [{ opacity: 0, transform: 'scale(.45)', filter: 'blur(12px)', background: 'radial-gradient(circle, rgba(255,255,255,.24), rgba(255,110,195,.12) 32%, transparent 68%)' }, { opacity: .78, transform: 'scale(1)', filter: 'blur(5px)', offset: .48 }, { opacity: 0, transform: 'scale(1.4)', filter: 'blur(15px)' }], 980, ease.dramatic, ['bloom']),
  simplePreset('prism-veil', 'global.transition', '棱镜薄幕', '低透明彩色薄幕折射后自然消退。', [{ opacity: 0, filter: 'blur(16px) hue-rotate(-18deg)', background: 'linear-gradient(125deg, rgba(80,180,255,.14), transparent 38%, rgba(255,105,190,.17) 62%, transparent)' }, { opacity: .68, filter: 'blur(6px) hue-rotate(12deg)', offset: .5 }, { opacity: 0, filter: 'blur(14px) hue-rotate(0deg)' }], 1050, ease.soft, ['prism']),
  simplePreset('starlight-wash', 'global.transition', '星辉洗礼', '中心高光与外围柔光形成短暂星辉。', [{ opacity: 0, transform: 'scale(.72)', filter: 'brightness(1.5) blur(16px)', background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,.28), rgba(160,190,255,.12) 24%, transparent 62%)' }, { opacity: .75, transform: 'scale(1.04)', filter: 'brightness(1.16) blur(6px)', offset: .52 }, { opacity: 0, transform: 'scale(1.26)', filter: 'brightness(1) blur(14px)' }], 1020, ease.dramatic, ['starlight']),
  gsapPreset('iris-field', 'global.transition', '虹膜光场', '圆形光场从中心展开后回收，形成一次完整呼吸。', { opacity: 0, scale: 0.48, clipPath: 'circle(8% at 50% 50%)', filter: 'blur(16px)', background: 'radial-gradient(circle, rgba(255,255,255,.28), rgba(255,110,200,.16) 36%, transparent 70%)' }, { opacity: 0.78, scale: 1.18, clipPath: 'circle(72% at 50% 50%)', filter: 'blur(5px)' }, 620, 'power3.inOut', ['iris'], { repeat: 1, yoyo: true }),
  gsapPreset('diagonal-curtain', 'global.transition', '斜幕流光', '斜向剪裁幕布穿过内容区域，再反向自然退场。', { opacity: 0, xPercent: -28, clipPath: 'inset(0 100% 0 0 round 28px)', background: 'linear-gradient(120deg, rgba(80,180,255,.12), rgba(255,110,205,.22), transparent)' }, { opacity: 0.72, xPercent: 18, clipPath: 'inset(0 0% 0 0 round 0px)' }, 560, 'expo.inOut', ['curtain'], { repeat: 1, yoyo: true }),
  gsapPreset('depth-pulse-field', 'global.transition', '纵深脉冲场', '大范围光场从远处压近并回落，增强页面空间切换感。', { opacity: 0, scale: 0.36, rotationX: -16, filter: 'blur(24px) brightness(1.8)', background: 'radial-gradient(ellipse, rgba(120,190,255,.2), rgba(255,105,195,.14) 42%, transparent 72%)' }, { opacity: 0.68, scale: 1.24, rotationX: 0, filter: 'blur(7px) brightness(1.1)' }, 680, 'power4.inOut', ['depth'], { repeat: 1, yoyo: true })
]

const pack = {
  schemaVersion: 1,
  title: 'Cyrene Signature Motion',
  description: '54 polished mixed GSAP and WAAPI presets for CyreneNameRoller Plugin API 1.2.',
  presets
}

await fs.mkdir(path.dirname(outFile), { recursive: true })
await fs.writeFile(outFile, `${JSON.stringify(pack, null, 2)}\n`, 'utf8')
console.log(`Generated ${presets.length} animation presets at ${outFile}`)
