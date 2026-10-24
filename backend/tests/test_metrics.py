import math
import pytest
from app.services.metric_service import metric_service

def test_calculate_angle_2d():
    # Right angle (90 degrees)
    # p1 = (0, 1), vertex p2 = (0, 0), p3 = (1, 0)
    p1 = (0.0, 1.0)
    p2 = (0.0, 0.0)
    p3 = (1.0, 0.0)
    angle = metric_service._calculate_angle_2d(p1, p2, p3)
    assert abs(angle - 90.0) < 0.1

    # Straight line (180 degrees)
    p1 = (-1.0, 0.0)
    p2 = (0.0, 0.0)
    p3 = (1.0, 0.0)
    angle = metric_service._calculate_angle_2d(p1, p2, p3)
    assert abs(angle - 180.0) < 0.1

def test_trunk_inclination():
    # Perfectly vertical trunk (shoulders directly above hips)
    l_sh = {"x": 0.45, "y": 0.2}
    r_sh = {"x": 0.55, "y": 0.2}
    l_hip = {"x": 0.45, "y": 0.5}
    r_hip = {"x": 0.55, "y": 0.5}

    angle = metric_service._calculate_trunk_inclination(l_sh, r_sh, l_hip, r_hip)
    assert abs(angle - 0.0) < 0.1

    # Forward lean trunk (shoulders shifted forward in x)
    l_sh_lean = {"x": 0.55, "y": 0.2}
    r_sh_lean = {"x": 0.65, "y": 0.2}
    angle_lean = metric_service._calculate_trunk_inclination(l_sh_lean, r_sh_lean, l_hip, r_hip)
    assert angle_lean > 5.0

def test_symmetry_index_calculation():
    # Perfect symmetry: Left 150 deg, Right 150 deg -> SI = 0%
    lk = 150.0
    rk = 150.0
    si = 2.0 * abs(lk - rk) / (lk + rk) * 100.0
    assert si == 0.0

    # Asymmetry: Left 140 deg, Right 160 deg -> SI = 2 * 20 / 300 * 100 = 13.33%
    lk = 140.0
    rk = 160.0
    si = 2.0 * abs(lk - rk) / (lk + rk) * 100.0
    assert abs(si - 13.33) < 0.05
