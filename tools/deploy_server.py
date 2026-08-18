import subprocess
from pathlib import Path

import paramiko

root_dir = Path(__file__).parent.parent
server_dir = root_dir / "server"

EC2_USER = "ec2-user"
EC2_HOST = "ec2-15-152-30-0.ap-northeast-3.compute.amazonaws.com"
SSH_KEY = Path.home() / ".ssh" / "wordch.pem"

subprocess.run(
    ["./gradlew", "build"],
    cwd=server_dir,
    check=True
)

jar_path = server_dir / "build" / "libs" / "wordch-0.0.1-SNAPSHOT.jar"

# EC2にSSH接続
client = paramiko.SSHClient()

client.connect(
    hostname=EC2_HOST,
    username=EC2_USER,
    key_filename=SSH_KEY
)

# JARをE転送
sftp = client.open_sftp()

sftp.put(
    jar_path,
    "/home/ec2-user/wordch.jar"
)

# serviceディレクトリ作成、終わるまで待つ
stdin, stdout, stderr = client.exec_command("mkdir -p ~/service")
stdout.channel.recv_exit_status()

# serviceも転送
sftp.put(
    root_dir / "service" / "wordch.service",
    "/home/ec2-user/service/wordch.service"
)
sftp.put(
    root_dir / "service" / "move_service.sh",
    "/home/ec2-user/service/move_service.sh"
)

# move_service.shを実行
stdin, stdout, stderr = client.exec_command(
    "bash ~/service/move_service.sh"
)

# stdout / stderr を読んで結果を確認する
print(stdout.read().decode())
print(stderr.read().decode())

sftp.close()
client.close()