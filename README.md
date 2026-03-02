cd /root/AI-POCs-FrontEnd
npm run build
rm -rf /var/www/react/dist/*
cp -r dist/* /var/www/react/dist/
systemctl reload nginx