# setup.py
from setuptools import setup, find_packages

setup(
    name="ansapra",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "Flask>=3.0.0",
        "Flask-CORS>=4.0.0",
        "requests>=2.31.0",
        "python-dotenv>=1.0.0",
        "gunicorn>=21.2.0",
        "Werkzeug>=3.0.0",
    ],
    python_requires=">=3.8",
)
