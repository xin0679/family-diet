#!/usr/bin/env python3
"""
图标生成脚本 - Family Diet PWA
生成各种尺寸的 PWA 图标
"""

from PIL import Image, ImageDraw
import os

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUTPUT_DIR = "icons"

def create_rounded_rectangle(draw, xy, radius, fill):
    """绘制圆角矩形"""
    x1, y1, x2, y2 = xy
    
    # 主体矩形
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
    
    # 四个圆角
    draw.ellipse([x1, y1, x1 + radius * 2, y1 + radius * 2], fill=fill)
    draw.ellipse([x2 - radius * 2, y1, x2, y1 + radius * 2], fill=fill)
    draw.ellipse([x1, y2 - radius * 2, x1 + radius * 2, y2], fill=fill)
    draw.ellipse([x2 - radius * 2, y2 - radius * 2, x2, y2], fill=fill)

def generate_icon(size):
    """生成单个图标"""
    # 创建图像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 渐变背景色（从左上到右下）
    # 简化处理：使用纯色背景，#10b981
    bg_color = (16, 185, 129, 255)  # #10b981
    corner_radius = int(size * 0.2)
    
    # 绘制圆角矩形背景
    create_rounded_rectangle(draw, (0, 0, size, size), corner_radius, bg_color)
    
    # 计算中心点
    center_x = size // 2
    center_y = size // 2
    radius = int(size * 0.35)
    
    # 绘制外圈（白色圆环）
    white = (255, 255, 255, 255)
    white_transparent = (255, 255, 255, 77)  # 30% 透明度
    line_width = max(2, int(size * 0.04))
    
    # 外圈
    draw.ellipse(
        [center_x - radius, center_y - radius, 
         center_x + radius, center_y + radius],
        outline=white, width=line_width
    )
    
    # 内圈（半透明白色填充）
    inner_radius = int(radius * 0.6)
    draw.ellipse(
        [center_x - inner_radius, center_y - inner_radius,
         center_x + inner_radius, center_y + inner_radius],
        fill=white_transparent
    )
    
    # 绘制小圆点装饰（叶子形状简化）
    dot_radius = max(3, int(size * 0.06))
    dot_x = center_x - int(radius * 0.3)
    dot_y = center_y - int(radius * 0.3)
    draw.ellipse(
        [dot_x - dot_radius, dot_y - dot_radius,
         dot_x + dot_radius, dot_y + dot_radius],
        fill=white
    )
    
    return img

def main():
    """主函数"""
    # 确保输出目录存在
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("🥗 开始生成 PWA 图标...\n")
    
    for size in SIZES:
        img = generate_icon(size)
        filename = f"icon-{size}x{size}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        img.save(filepath, 'PNG')
        print(f"  ✅ {filename}")
    
    print(f"\n🎉 完成！已生成 {len(SIZES)} 个图标")
    print(f"📁 输出目录: {os.path.abspath(OUTPUT_DIR)}")

if __name__ == "__main__":
    main()
