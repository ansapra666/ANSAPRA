# gunicorn_config.py
import os
import multiprocessing

# 绑定端口
bind = "0.0.0.0:" + os.environ.get("PORT", "10000")

# Worker数量（根据CPU核心数调整）
workers = multiprocessing.cpu_count() * 2 + 1

# Worker类
worker_class = "sync"

# 超时时间（秒），增加以处理大文件
timeout = 180

# 保持连接
keepalive = 5

# 日志配置
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 进程名称
proc_name = "ansapra"

# 最大请求数，防止内存泄漏
max_requests = 1000
max_requests_jitter = 50

# 禁用gunicorn自己的安全头
secure_scheme_headers = {'X-FORWARDED-PROTOCOL': 'ssl', 'X-FORWARDED-PROTO': 'https', 'X-FORWARDED-SSL': 'on'}
