---
layout: page
title: CDSC
permalink: /assignments/
description: Class Assignments
nav: true
nav_order: 2
horizontal: false
---

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Assignment 1](#assignment-1)
  - [Buck Converter Design and Control using MATLAB and Simulink](#buck-converter-design-and-control-using-matlab-and-simulink)
    - [Assignment Description:](#assignment-description)
    - [Deliverables:](#deliverables)
    - [Assessment Criteria:](#assessment-criteria)
    - [Links:](#links)
- [Assignment 2](#assignment-2)
  - [Inverted Pendulum Control using Python and Gym Library](#inverted-pendulum-control-using-python-and-gym-library)
    - [Assignment Description:](#assignment-description-1)
    - [Deliverables:](#deliverables-1)
    - [Assessment Criteria:](#assessment-criteria-1)
    - [Links](#links-1)
- [Assignment 3](#assignment-3)
  - [Robot Control in Webots with Hyperparameter Tuning](#robot-control-in-webots-with-hyperparameter-tuning)
    - [Assignment Description:](#assignment-description-2)
    - [Deliverables:](#deliverables-2)
    - [Assessment Criteria:](#assessment-criteria-2)
    - [Links](#links-2)

# Assignment 1

## Buck Converter Design and Control using MATLAB and Simulink

The buck converter is a type of DC-DC converter that steps down voltage from its input to its output. It operates in two modes: the switch (usually a transistor) is either in the on-state (closed) or in the off-state (open).

Assuming continuous conduction mode (CCM), the voltage transfer function in the s-domain (Laplace domain) is given by:

$$
\frac{V_o(s)}{V_i(s)} = \frac{D}{1 + sRC + s^2LC}
$$

where:
- Vout(s) and Vin(s) are the Laplace transforms of the output and input voltages respectively,
- D is the duty cycle of the PWM control,
- s is the complex frequency in the Laplace domain,
- R is the load resistance,
- L is the inductance, and
- C is the capacitance.


### Assignment Description:

- **Defining Buck Converter Parameters:** Use the tool available at laioseman.com/ccccjsv2 to define the parameters for your buck converter. This should include the input voltage (Vin), the output voltage (Vout), and other necessary parameters such as frequency, duty cycle, load resistance, etc.

- **Designing Buck Converter in MATLAB:** Utilize MATLAB to design your buck converter based on the parameters defined. Generate and analyze all the relevant waveforms such as input and output voltages, current waveforms, etc.

- **Implementation and Control in Simulink's SimScape:** Implement your buck converter design in SimScape, an advanced simulation environment in Simulink. Use various control strategies to control the output voltage of the buck converter under different load conditions. Verify the stability and performance of the control system under different operating conditions.

- **Documentation:** Document all your steps, observations, and conclusions. Include necessary screenshots, plots, graphs, and other relevant visuals. Make sure to describe each step of your work in a clear and comprehensible way, so that readers with various levels of knowledge can understand your process and results.

- Apply direct tuning methods, such as Ziegler-Nichols, to design a controller for the system. You can also use Sisotool (https://www.mathworks.com/help/control/ref/controlsystemdesigner-app.html) to design your controller.

### Deliverables:

- A comprehensive report detailing your design process, implementation, control strategy, and results. Include screenshots and diagrams where necessary.
The MATLAB and Simulink files used in your work.

- A presentation summarizing your findings, suitable for a 15-minute presentation.

### Assessment Criteria:

Your assignment will be assessed based on the following:

- Clarity and thoroughness of your report and presentation.

- Correctness and complexity of your MATLAB and Simulink designs.

- Ability to effectively control the output voltage of the buck converter under various conditions.

- Grades will be given individually.

### Links:

- https://laioseman.com/ccccjsv2
- http://www.mathworks.com/help/sps/ug/buck-converter.html

# Assignment 2

## Inverted Pendulum Control using Python and Gym Library

### Assignment Description:

- **Understanding Inverted Pendulum Dynamics:** Start with a brief overview of the theory and principles of the inverted pendulum system. Highlight the challenges related to balancing the pendulum and the key aspects of its dynamic behaviour.

- **Setting Up the Environment:** Set up your Python environment and install the Gymnasium library. Gymnasium is a toolkit for developing and comparing reinforcement learning algorithms. It provides a variety of environments, including the CartPole-v1 for the inverted pendulum problem.

- **Implementing the Inverted Pendulum in Gymnasium:** Utilize the CartPole-v1 environment provided by Gymnasium to implement the inverted pendulum problem. This environment simulates the dynamics of the inverted pendulum and provides a reward system for balancing the pendulum.

- **Designing the Controller:** Develop a control strategy to balance the inverted pendulum and prevent it from falling over. This could involve a self-tuning algorithm algorithm, a classic control approach, or a combination of both.

- **Simulation and Evaluation:** Run simulations to test the effectiveness of your control strategy. Monitor the performance by considering the time the pole stays upright and the cumulative reward earned during the simulation.

- **Documentation:** Document all your steps, code, observations, and conclusions. Include relevant visualizations, such as plots of the pendulum's state over time or the cumulative reward.

### Deliverables:

- A comprehensive report detailing your design process, control strategy, simulation results, and conclusions. Include relevant screenshots, code snippets, and plots.

- The Python code files used for the assignment.

- A presentation summarizing your findings.

### Assessment Criteria: 

Your assignment will be assessed based on:

- The correctness and complexity of your Python code and control design.

- Your understanding of the inverted pendulum problem and control strategies, as demonstrated in your work and report.

- The effectiveness of your control strategy, as shown by your simulation results.

- The clarity and quality of your report and presentation.

- Grades will be given individually.

### Links

- https://gymnasium.farama.org
- https://ctms.engin.umich.edu/CTMS/index.php?example=InvertedPendulum&section=SystemModeling
- https://www3.diism.unisi.it/~control/ctm/examples/pend/invpen.html

# Assignment 3

##  Robot Control in Webots with Hyperparameter Tuning

The goal of this assignment is to create a custom environment in Webots, design a robot with a specific behavior to control, and apply hyperparameter tuning methods using libraries like Optuna, Open-Box, or PyDAE to design an optimal PID controller for the robot.

### Assignment Description:

- **World Creation in Webots:** Start by creating your custom world in Webots. Define the layout, objects, and other features of the world as per the problem requirements.

- **Robot Behavior Definition:** Define a specific behavior that you want to control in a robot. This could be anything from obstacle avoidance and path tracking to balance control and object manipulation.

- **PID Controller Design:** Develop a PID controller to manage the desired behavior of the robot. This controller will provide the necessary control inputs to the robot based on the observed error between the desired and actual behaviors.

- **Hyperparameter Optimization Setup:** Set up a hyperparameter optimization framework using Optuna, Open-Box, or another hyperparameter tuning library of your choice. Define the parameter space for your PID gains and any other hyperparameters of your controller.

- **PID Tuning:** Use the optimization framework to tune the PID gains and optimize the performance of your controller. You should aim to maximize the performance of your robot in terms of the defined behavior.

- **Evaluation and Documentation:** Evaluate the performance of your tuned controller through simulations in Webots. Document all your steps, observations, code, and conclusions. Include relevant screenshots, code snippets, and performance plots.

### Deliverables:

- A comprehensive report detailing your world creation, behavior definition, PID design, hyperparameter optimization process, and evaluation results. Include relevant screenshots, code snippets, and performance plots.

- The Webots world and robot files, along with the Python code files used for the assignment.

- A presentation summarizing your findings.

### Assessment Criteria:

Your assignment will be assessed based on:

- The complexity and creativity of your custom world and robot behavior.
  
- The correctness and sophistication of your PID design and tuning method.
  
- Your understanding of PID control, hyperparameter optimization, and their application to robot behavior control, as demonstrated in your work and report.
  
- The performance of your tuned controller, as shown by your simulation results.
  
- The clarity and quality of your report and presentation.

- Grades will be given individually.

### Links

- https://cyberbotics.com
- https://optuna.org
- https://github.com/pydae/pydae
- https://github.com/PKU-DAIR/open-box