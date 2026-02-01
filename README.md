# 截图拼接工具 - Screenshot Grid Stitcher

一个纯前端的截图拼接Web应用，支持将多张截图拼接成Grid形式的大图。

## 功能特点

- 批量上传图片（无数量限制）
- 拖拽上传支持
- 点击图片全屏预览
- 灵活的拼接设置（间距、清晰度）
- 自动计算布局
- 倒序功能
- 重新拼接
- 高清PNG导出
- PWA支持（可安装到手机主屏幕）
- 离线使用
- 完全在本地处理，图片不会上传到服务器

## 本地测试

1. 克隆或下载项目文件
2. 在项目目录运行：
   ```bash
   python3 -m http.server 8000
   ```
3. 在浏览器中访问：http://localhost:8000

## 部署到阿里云服务器

### 前提条件

- 拥有阿里云服务器（Ubuntu/CentOS）
- 拥有域名（已解析到服务器IP）
- 服务器有root权限

### 自动部署（推荐）

1. 将项目文件上传到服务器
2. 运行部署脚本：
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
3. 按照提示输入域名和网站根目录
4. 脚本会自动：
   - 安装Nginx和Certbot
   - 配置Nginx
   - 申请Let's Encrypt免费SSL证书
   - 设置证书自动续期

### 手动部署

#### 1. 安装Nginx

Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y nginx
```

CentOS/RHEL:
```bash
sudo yum install -y epel-release
sudo yum install -y nginx
```

#### 2. 安装Certbot（SSL证书）

Ubuntu/Debian:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

CentOS/RHEL:
```bash
sudo yum install -y certbot python3-certbot-nginx
```

#### 3. 配置Nginx

创建配置文件 `/etc/nginx/sites-available/your-domain.com`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/screenshot-stitcher;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|json)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：
```bash
sudo ln -sf /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. 上传文件

```bash
sudo mkdir -p /var/www/screenshot-stitcher
sudo cp index.html style.css app.js manifest.json sw.js icon-256.png /var/www/screenshot-stitcher/
sudo chown -R www-data:www-data /var/www/screenshot-stitcher  # Ubuntu/Debian
# 或
sudo chown -R nginx:nginx /var/www/screenshot-stitcher  # CentOS/RHEL
sudo chmod -R 755 /var/www/screenshot-stitcher
```

#### 5. 申请SSL证书

```bash
sudo certbot --nginx -d your-domain.com
```

按照提示输入邮箱地址并同意服务条款。

#### 6. 设置证书自动续期

```bash
sudo certbot renew --dry-run
```

## PWA安装

### 安卓手机

1. 在Chrome或Edge浏览器中访问：`https://`your-domain.com`
2. 点击浏览器菜单（三个点）
3. 选择"添加到主屏幕"或"安装应用"
4. 确认安装

### iOS手机

1. 在Safari浏览器中访问：`https://`your-domain.com`
2. 点击分享按钮（方框向上箭头）
3. 向下滚动，选择"添加到主屏幕"
4. 点击"添加"

## 安全性说明

### 🔒 安全性特点

#### 1. 完全本地处理
- 所有图片处理在浏览器本地完成
- 不上传任何图片到服务器
- 不收集任何用户数据
- 保护用户隐私

#### 2. 纯前端应用
- 无后端服务器
- 无数据库
- 无用户认证
- 无数据传输

#### 3. HTTPS加密
- 使用SSL/TLS加密传输
- 保护连接安全
- 防止中间人攻击

#### 4. PWA离线能力
- 首次下载后可离线使用
- 不需要网络连接
- 完全本地运行

### 🔐 安全保证

- ✅ 零数据上传 - 图片不离开设备
- ✅ 零数据收集 - 不收集任何用户信息
- ✅ 零依赖 - 不依赖第三方服务
- ✅ 开源透明 - 代码完全公开

## 核心实现技术

### 🛠️ 前端技术栈

#### 1. 基础技术
- **HTML5** - 页面结构
- **CSS3** - 响应式设计
- **JavaScript (ES6+)** - 核心逻辑

#### 2. 图像处理技术
- **Canvas 2D API** - 图像绘制和操作
- **Blob API** - 二进制数据处理
- **DataURL** - 图像数据编码
- **File API** - 文件上传和下载

#### 3. PWA技术
- **Service Worker** - 离线缓存
- **Web App Manifest** - 应用配置
- **FileSaver.js** - 跨浏览器下载

#### 4. 部署技术
- **Nginx** - 静态文件服务
- **HTTPS** - 安全传输
- **反向代理** - 端口转发

### 💡 技术优势

#### 1. 性能优化
- 客户端处理 - 减少服务器负载
- 离线缓存 - 快速加载
- 响应式设计 - 适配各种设备

#### 2. 用户体验
- 批量上传 - 无数量限制
- 实时预览 - 即时看到效果
- 点击预览 - 点击图片全屏查看
- 倒序功能 - 快速调整图片顺序
- 灵活设置 - 调整间距和清晰度
- PWA安装 - 像原生App

#### 3. 兼容性
- 跨浏览器支持 - Chrome、Edge、Safari
- 移动端优化 - iOS、Android、鸿蒙
- 响应式布局 - 手机、平板、电脑

### 📋 技术架构

```
用户浏览器
    ↓
上传图片（本地）
    ↓
Canvas处理（本地）
    ↓
生成拼接图（本地）
    ↓
下载图片（本地）
```

### 🎯 适用场景

- 隐私敏感 - 不想上传图片到云端
- 快速处理 - 不需要等待服务器响应
- 离线使用 - 没有网络也能用
- 批量处理 - 一次处理多张截图

## 技术栈

- 纯HTML/CSS/JavaScript
- Canvas API（图片处理）
- Service Worker（离线缓存）
- PWA（可安装到主屏幕）

## 文件说明

- `index.html` - 主页面
- `style.css` - 样式文件
- `app.js` - 核心功能代码
- `manifest.json` - PWA配置文件
- `sw.js` - Service Worker（离线缓存）
- `icon-256.png` - 256x256图标
- `deploy.sh` - 自动部署脚本

## 许可证

MIT License