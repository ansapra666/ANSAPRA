# gunicorn_config.py
import multiprocessing

# gunicorn_config.py
bind = "0.0.0.0:10000"
workers = 2
worker_class = "sync"
timeout = 120  # 增加到120秒
keepalive = 5
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50

# 日志设置
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 进程名称
proc_name = "ansapra"

# 防止worker被杀死前的时间
graceful_timeout = 30

# 最大请求数，防止内存泄漏
max_requests = 1000
max_requests_jitter = 50

