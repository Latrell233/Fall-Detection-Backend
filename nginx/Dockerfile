FROM nginx:1.25

COPY nginx.conf /etc/nginx/nginx.conf
COPY html/ /usr/share/nginx/html/

# 可选：复制静态资源目录（如有）
# COPY ../public /usr/share/nginx/html 