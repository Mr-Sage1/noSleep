import ctypes
import sys
import time

class SageSleeper:
    """
    A utility class to manage Windows sleep states.
    Can be used by calling its class methods, or as a Python context manager ('with' statement).
    """
    # Constants for Windows API
    ES_CONTINUOUS = 0x80000000
    ES_SYSTEM_REQUIRED = 0x00000001
    ES_DISPLAY_REQUIRED = 0x00000002

    @classmethod
    def prevent_sleep(cls, keep_display_on=True):
        """
        Prevent the system from going to sleep.
        By default, it also prevents the monitor from turning off.
        """
        if sys.platform != 'win32':
            print("Warning: SageSleeper is only supported on Windows.")
            return False

        flags = cls.ES_CONTINUOUS | cls.ES_SYSTEM_REQUIRED
        if keep_display_on:
            flags |= cls.ES_DISPLAY_REQUIRED
            
        ctypes.windll.kernel32.SetThreadExecutionState(flags)
        return True

    @classmethod
    def allow_sleep(cls):
        """Allow the system and display to go to sleep normally."""
        if sys.platform != 'win32':
            return False
            
        ctypes.windll.kernel32.SetThreadExecutionState(cls.ES_CONTINUOUS)
        return True

    # -- Context Manager Protocol --
    def __enter__(self):
        """Called when entering a 'with' block."""
        self.prevent_sleep(keep_display_on=True)
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """Called when exiting a 'with' block, ensuring settings are automatically restored."""
        self.allow_sleep()


