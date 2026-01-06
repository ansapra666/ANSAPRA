#!/bin/bash
# install_deps.sh

echo "开始安装依赖..."

# 升级pip
pip install --upgrade pip

# 安装setuptools的兼容版本
pip install "setuptools<81"

# 安装其他依赖
pip install -r requirements.txt

echo "依赖安装完成！"
