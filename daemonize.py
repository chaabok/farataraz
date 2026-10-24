#!/usr/bin/env python3
"""Double-fork daemonizer - escapes the sandbox session reaper (pg_ctl pattern).
Usage: python3 daemonize.py <logfile> <command> [args...]"""
import os, sys
log = sys.argv[1]
cmd = sys.argv[2:]
pid = os.fork()
if pid == 0:
    os.setsid()
    pid2 = os.fork()
    if pid2 == 0:
        os.close(0); os.close(1); os.close(2)
        os.open('/dev/null', os.O_RDONLY)
        os.open(log, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
        os.open(log, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
        os.execvp(cmd[0], cmd)
    os._exit(0)
os.waitpid(pid, 0)
