# gunicorn_config.py
import multiprocessing

# 服务器设置
bind = "0.0.0.0:10000"
workers = 2
threads = 4
worker_class = "sync"

# 超时设置
timeout = 120
keepalive = 5

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
