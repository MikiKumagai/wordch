import subprocess
from pathlib import Path

import paramiko

# プロジェクトのルート
project_dir = Path(__file__).parent.parent

# serverディレクトリ
server_dir = project_dir / "server"

# EC2接続情報
EC2_USER = "ec2-user"
EC2_HOST = "ec2-15-152-30-0.ap-northeast-3.compute.amazonaws.com"
SSH_KEY = Path.home() / ".ssh" / "wordch.pem"

# server に移動して ./gradlew build
subprocess.run(
    ["./gradlew", "build"],
    cwd=server_dir,
    check=True
)

# JAR
jar_path = server_dir / "build" / "libs" / "wordch-0.0.1-SNAPSHOT.jar"

# EC2にSSH接続
client = paramiko.SSHClient()

client.connect(
    hostname=EC2_HOST,
    username=EC2_USER,
    key_filename=SSH_KEY
)

# JARをEC2へ転送
sftp = client.open_sftp()

sftp.put(
    jar_path,
    "/home/ec2-user/wordch.jar"
)

# serviceディレクトリ作成、終わるまで待ってファイル転送
stdin, stdout, stderr = client.exec_command("mkdir -p ~/service")
stdout.channel.recv_exit_status()

# serviceを転送
sftp.put(
    project_dir / "service" / "wordch.service",
    "/home/ec2-user/service/wordch.service"
)
sftp.put(
    project_dir / "service" / "move_service.sh",
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