import numpy as np

# Constants:
l = 1.0
time_step = 0.1
final_t = 10.0
x_0 = 0.0
y_0 = 0.1
theta_0 = 30.0 * np.pi /180
delta_0 = 2.0 * np.pi /180
Q_t = np.mat([[0.1, 0.0],[0.0, 0.3]])

# State:
num_state_vars = 4
num_measurable_state_vars = 2

# Prelims
np.random.seed(1) # for noise

# Performs EKF, input is covariance matrix, returns state data
def ekf(R, sigma_0):
  x_t = x_0
  y_t = y_0
  theta_t = theta_0
  delta_t = delta_0
  H = np.zeros((num_measurable_state_vars, num_state_vars), float)

  R_diagonals = np.diag(R)
  print(R_diagonals.shape)
  sigma_t = sigma_0
  record = [(x_t, y_t)]

  for t in np.arange(0.1, final_t+0.1, time_step):
    # Control values:
    v = 10.0*np.sin(t)
    omega_delta = 0.01*unit_step(t)

    # Predictions - Motion model
    pred_x_t = x_t + time_step*(v*np.cos(theta_t))
    pred_y_t = y_t + time_step*(v*np.sin(theta_t))
    pred_delta_t = delta_t + time_step*omega_delta
    pred_theta_t = theta_t + (time_step/l)*v*np.tan(pred_delta_t)

    # Note: pred_mew_t is a 4x1, column vec
    pred_mew_t = np.array([[pred_x_t],[pred_y_t],[pred_theta_t],[pred_delta_t]])
    # print(pred_mew_t.shape)
    # Predictions - Add error
    pred_mew_t = pred_mew_t + np.array([R_diagonals[0]*np.random.randn(1),
                                        R_diagonals[1]*np.random.randn(1),
                                        R_diagonals[2]*np.random.randn(1),
                                        R_diagonals[3]*np.random.randn(1)])
    # print(pred_mew_t.shape)

    # Predictions - Sigma
    # For G (from jacobian)
    diff_g1_wrt_theta = (-1.0)*time_step*np.sin(theta_t)
    diff_g2_wrt_theta = time_step*np.cos(theta_t)
    diff_g3_wrt_delta = (time_step*v*(np.tan(pred_delta_t)**2.0 + 1.0))/l

    # 4x4
    G = np.mat([[1.0, 0.0, diff_g1_wrt_theta, 0.0],
                [0.0, 1.0, diff_g2_wrt_theta, 0.0],
                [0.0, 0.0, 1.0, diff_g3_wrt_delta],
                [0.0, 0.0, 0.0, 1.0]])

    # For H (from jacobian)
    diff_h1_wrt_x = pred_x_t/np.sqrt(pred_x_t**2.0 + pred_y_t**2.0)
    diff_h1_wrt_y = pred_y_t/np.sqrt(pred_x_t**2.0 + pred_y_t**2.0)
    diff_h2_wrt_x = (-1.0)*pred_y_t/(pred_x_t**2.0 + pred_y_t**2.0)
    diff_h2_wrt_y = (-1.0)*pred_x_t/(pred_x_t**2.0 + pred_y_t**2.0)

    # 2x4
    H = np.mat([[diff_h1_wrt_x, diff_h1_wrt_y, 0.0, 0.0],
                [diff_h2_wrt_x, diff_h2_wrt_y, 0.0, 0.0]])

    # Prediction - Sigma, 4x4
    pred_sigma_t = G @ sigma_t @ G.transpose() + R

    # Kalmain Gain, 4x2
    k_t =  pred_sigma_t @ H.transpose() @ np.linalg.inv(H.astype(np.float32) @ pred_sigma_t.astype(np.float32) @ H.transpose().astype(np.float32) + Q_t.astype(np.float32))

    # Don't need to actually calculate z and h(x) since only diff between
    # them is gaussian noise (both based on predicted)
    measurement_noise_x = np.sqrt(Q_t[0,0]) * np.random.randn()
    measurement_noise_y = np.sqrt(Q_t[1,1]) * np.random.randn()


    # 4x1 + 4x2.2x1 = 4x1 - This is weird ... why are there values in mew_t for theta and delta?
    # print(pred_mew_t.shape)
    # print(k_t.shape)
    mew_t = pred_mew_t + k_t @ np.array([[measurement_noise_x],
                                          [measurement_noise_y]])
    # update timestamps
    # print("ahhahah")
    # print(mew_t)
    x_t = mew_t[0,0]
    y_t = mew_t[1,0]
    theta_t = pred_mew_t[2]
    delta_t = pred_mew_t[3]

    sigma_t = (np.eye(4) - k_t @ H) @ pred_sigma_t

    record.append((x_t, y_t))


  return record

def unit_step(t):
  if t > 0:
    return 1
  else:
    return 0

R = np.diag([0.01, 0.01, 0.001, 0.001])
sigma_0 = np.diag([0.01, 0.01, 0.01, 0.01])
record = ekf(R, sigma_0)
