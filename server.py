from flask import Flask, request, redirect, url_for, send_from_directory, render_template, jsonify 
import os
from werkzeug.utils import secure_filename
import re

# 配置
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 限制最大上传文件大小为100MB
# 修改：移除文件类型限制
app.config['ALLOWED_EXTENSIONS'] = None  # 或直接删除这行

# 添加：获取服务器IP地址
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    local_ip = s.getsockname()[0]
    s.close()
except Exception:
    local_ip = '127.0.0.1'

# 创建上传文件夹（如果不存在）
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 检查文件扩展名是否允许
def allowed_file(filename):
    # 修改：始终返回True以允许所有文件类型
    return True
    # 保留原代码作为注释，方便日后恢复
    # return '.' in filename and \
    #        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# 添加自定义文件名安全处理函数
def custom_secure_filename(filename):
    # 移除危险字符但保留非ASCII字符
    filename = re.sub(r'[\\/*?:<>|"]', '', filename)
    return filename

# 主页 - 文件上传和下载界面
@app.route('/')
def index():
    # 获取上传文件夹中的所有文件
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    files = [f for f in files if os.path.isfile(os.path.join(app.config['UPLOAD_FOLDER'], f))]
    
    # 修改：传递服务器IP到模板
    return render_template('index.html', files=files, server_ip=local_ip)


# 文件上传处理
@app.route('/upload', methods=['POST'])  # 修改：使用独立的上传路由
def upload_file():
    # 检查是否有文件部分
    if 'file' not in request.files:
        return jsonify(success=False, error='未找到文件部分'), 400
    file = request.files['file']
    # 如果用户没有选择文件，浏览器也会提交一个空部分
    if file.filename == '':
        return jsonify(success=False, error='未选择文件'), 400
    if file and allowed_file(file.filename):
        filename = custom_secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # 检查文件是否已存在
        counter = 1
        base_filename, ext = os.path.splitext(filename)
        while os.path.exists(file_path):
            filename = f"{base_filename}({counter}){ext}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            counter += 1
            
        file.save(file_path)
        return jsonify(
            success=True, 
            message='文件上传成功',
            filename=filename
        )
    return jsonify(success=False, error='不允许的文件类型'), 400

# 文件下载处理
@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

# 添加文件删除功能
@app.route('/delete/<filename>', methods=['POST'])
def delete_file(filename):
    # 修复：对文件名进行解码
    filename = os.path.basename(filename)  # 确保只获取文件名，防止路径遍历攻击
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            # 修复：返回中文消息
            return jsonify(success=True, message='文件删除成功')
        return jsonify(success=False, error='文件不存在'), 404
    except Exception as e:
        return jsonify(success=False, error=f'删除失败: {str(e)}'), 500

if __name__ == '__main__':
    # 获取本地IP地址
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    local_ip = s.getsockname()[0]
    s.close()
    
    print(f'服务器运行中...')
    print(f'请在电脑或手机浏览器中访问: http://{local_ip}:5000')
    print(f'或者访问: http://localhost:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)