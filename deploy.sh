#!/bin/bash

echo "======================================"
echo "截图拼接工具 - 部署脚本"
echo "======================================"

read -p "请输入你的域名（如：example.com）: " DOMAIN
read -p "请输入网站根目录路径（如：/var/www/screenshot-stitcher）: " WEB_ROOT

if [ -z "$DOMAIN" ] || [ -z "$WEB_ROOT" ]; then
    echo "错误：域名和网站根目录不能为空"
    exit 1
fi

echo ""
echo "======================================"
echo "配置信息："
echo "域名: $DOMAIN"
echo "网站根目录: $WEB_ROOT"
echo "======================================"
echo ""

read -p "确认配置信息正确？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "部署已取消"
    exit 0
fi

echo ""
echo "开始部署..."
echo ""

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$[ID]
else
    echo "无法检测操作系统类型"
    exit 1
fi

echo "检测到操作系统: $OS"
echo ""

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    echo "安装Nginx和Certbot..."
    sudo apt update
    sudo apt install -y nginx certbot python3-certbot-nginx
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    echo "安装Nginx和Certbot..."
    sudo yum install -y epel-release
    sudo yum install -y nginx certbot python3-certbot-nginx
else
    echo "不支持的操作系统: $OS"
    exit 1
fi

echo ""
echo "创建网站目录..."
sudo mkdir -p $WEB_ROOT

echo ""
echo "复制文件到网站目录..."
sudo cp index.html style.css app.js manifest.json sw.js icon-192.png icon-512.png $WEB_ROOT/

echo ""
echo "设置文件权限..."
sudo chown -R www-data:www-data $WEB_ROOT 2>/dev/null || sudo chown -R nginx:nginx $WEB_ROOT 2>/dev/null
sudo chmod -R 755 $WEB_ROOT

echo ""
echo "创建Nginx配置文件..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    root $WEB_ROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|json)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo ""
echo "启用Nginx配置..."
if [ -d /etc/nginx/sites-enabled ]; then
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
fi

echo ""
echo "测试Nginx配置..."
sudo nginx -t

echo ""
echo "重启Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "======================================"
echo "申请SSL证书..."
echo "======================================"
echo ""
echo "请按照提示输入邮箱地址并同意服务条款"
echo ""

sudo certbot --nginx -d $DOMAIN

echo ""
echo "======================================"
echo "设置SSL证书自动续期..."
echo "======================================"
sudo certbot renew --dry-run

echo "======================================"
echo "部署完成！"
echo "======================================"
echo ""
echo "访问地址: https://$DOMAIN"
echo ""
echo "PWA安装说明："
echo "1. 在手机浏览器中访问 https://$DOMAIN"
echo "2. Chrome/Edge: 点击菜单 -> '添加到主屏幕'"
echo "3. Safari: 点击分享按钮 -> '添加到主屏幕'"
echo ""
echo "注意事项："
echo "- 首次访问需要HTTPS才能安装PWA"
echo "- 安装后可以离线使用"
echo "- 所有图片处理都在本地完成，不会上传到服务器"
echo ""