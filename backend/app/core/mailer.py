import logging
from abc import ABC, abstractmethod

logger = logging.getLogger("groundup.mailer")


class Mailer(ABC):
    @abstractmethod
    async def send_mail(self, to_email: str, subject: str, body: str) -> bool:
        """Sends an email or logs it."""
        pass


class LogMailer(Mailer):
    """
    Log-based mailer for development and testing.
    Outputs email delivery details to structured application logs.
    """

    async def send_mail(self, to_email: str, subject: str, body: str) -> bool:
        logger.info(f"Dispatched email to {to_email} with subject: '{subject}'")
        return True


mailer = LogMailer()
