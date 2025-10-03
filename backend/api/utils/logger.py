import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


def configure_logging(log_level: int = logging.INFO) -> None:
    logs_dir = Path(__file__).resolve().parents[3] / "logs"
    logs_dir.mkdir(parents=True, exist_ok=True)

    log_file = logs_dir / "app.log"

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
    )

    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)

    file_handler = RotatingFileHandler(log_file, maxBytes=5 * 1024 * 1024, backupCount=5)
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers.clear()
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
