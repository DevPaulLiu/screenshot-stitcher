# 截图拼接工具 - Screenshot Grid Stitcher

一个纯前端的截图拼接Web应用，支持将多张截图拼接成Grid形式的大图。

## 功能特点

- 批量上传图片（最多100张）
- 拖拽上传支持
- 实时预览
- 灵活的拼接设置（列数、间距、边框、背景色、缩放比例）
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
sudo cp index.html style.css app.js manifest.json sw.js icon-192.png icon-512.png /var/www/screenshot-stitcher/
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

1. 在Chrome或Edge浏览器中访问：`https://your-domain.com`
2. 点击浏览器菜单（三个点）
3. 选择"添加到主屏幕"或"安装应用"
4. 确认安装

### iOS手机

1. 在Safari浏览器中访问：`https://your-domain.com`
2. 点击分享按钮（方框向上箭头）
3. 向下滚动，选择"添加到主屏幕"
4. 点击"添加"

## 安全性说明

- 所有图片处理都在浏览器本地完成
- 不会上传到任何服务器
- 不会收集任何用户数据
- 完全离线可用（首次安装后）

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
- `icon-192.png` - 192x192图标
- `icon-512.png` - 512x512图标
- `deploy.sh` - 自动部署脚本

## 许可证

MIT License