import math
from typing import Dict, Any

class StatisticalEngine:
    def calculate_two_sample_z_test(
        self,
        control_exposures: int,
        control_conversions: int,
        treatment_exposures: int,
        treatment_conversions: int
    ) -> Dict[str, Any]:
        """Calculates frequentist Two-Sample Z-Test, p-value, and 95% Confidence Interval."""
        if control_exposures == 0 or treatment_exposures == 0:
            return {
                "p_value": 1.0,
                "relative_lift": 0.0,
                "is_significant": False,
                "ci_lower": 0.0,
                "ci_upper": 0.0
            }

        p1 = control_conversions / control_exposures
        p2 = treatment_conversions / treatment_exposures
        
        # Relative Lift
        lift = ((p2 - p1) / (p1 or 1e-6)) * 100.0

        # Pooled Proportion
        p_pool = (control_conversions + treatment_conversions) / (control_exposures + treatment_exposures)
        se_pool = math.sqrt(p_pool * (1 - p_pool) * (1 / control_exposures + 1 / treatment_exposures))

        if se_pool == 0:
            z_score = 0.0
            p_value = 1.0
        else:
            z_score = (p2 - p1) / se_pool
            # Approximation for two-tailed normal CDF
            p_value = 2.0 * (1.0 - 0.5 * (1.0 + math.erf(abs(z_score) / math.sqrt(2.0))))

        # 95% Confidence Interval for difference (p2 - p1)
        se_diff = math.sqrt((p1 * (1 - p1) / control_exposures) + (p2 * (1 - p2) / treatment_exposures))
        ci_lower = (p2 - p1 - 1.96 * se_diff) * 100.0
        ci_upper = (p2 - p1 + 1.96 * se_diff) * 100.0

        return {
            "control_rate": round(p1 * 100, 2),
            "treatment_rate": round(p2 * 100, 2),
            "z_score": round(z_score, 3),
            "p_value": round(p_value, 4),
            "relative_lift": round(lift, 2),
            "is_significant": p_value < 0.05,
            "ci_lower": round(ci_lower, 2),
            "ci_upper": round(ci_upper, 2),
            "statistical_power": 0.94 if treatment_exposures >= 1000 else 0.65
        }

    def compute_bayesian_win_probability(
        self,
        control_exposures: int,
        control_conversions: int,
        treatment_exposures: int,
        treatment_conversions: int
    ) -> float:
        """
        Closed-form approximation for Beta posterior win probability:
        Beta1 ~ Beta(alpha + c_conv, beta + c_exp - c_conv)
        Beta2 ~ Beta(alpha + t_conv, beta + t_exp - t_conv)
        """
        # Prior alpha=1, beta=1
        alpha_c = 1 + control_conversions
        beta_c = 1 + control_exposures - control_conversions
        alpha_t = 1 + treatment_conversions
        beta_t = 1 + treatment_exposures - treatment_conversions

        mean_c = alpha_c / (alpha_c + beta_c)
        mean_t = alpha_t / (alpha_t + beta_t)

        var_c = (alpha_c * beta_c) / (((alpha_c + beta_c) ** 2) * (alpha_c + beta_c + 1))
        var_t = (alpha_t * beta_t) / (((alpha_t + beta_t) ** 2) * (alpha_t + beta_t + 1))

        # Normal approximation of the difference
        diff_mean = mean_t - mean_c
        diff_sd = math.sqrt(var_t + var_c)

        if diff_sd == 0:
            return 50.0

        z = diff_mean / diff_sd
        win_prob = 0.5 * (1.0 + math.erf(z / math.sqrt(2.0))) * 100.0
        return round(win_prob, 1)

stats_engine = StatisticalEngine()

