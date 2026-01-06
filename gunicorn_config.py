# gunicorn.conf.py
import multiprocessing

# 服务器设置
bind = "0.0.0.0:10000"
workers = 2
worker_class = "sync"

# 超时设置 - 这是关键！
timeout = 600  # 3分钟
keepalive = 5
graceful_timeout = 30

# Worker管理
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# 日志
accesslog = "-"
errorlog = "-"
loglevel = "info"
capture_output = True

# 连接设置
backlog = 2048
worker_connections = 1000

def when_ready(server):
    server.log.info(f"服务器启动完成，超时设置为 {timeout} 秒")

def worker_exit(server, worker):
    server.log.info(f"Worker {worker.pid} 退出")
