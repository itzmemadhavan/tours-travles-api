const db = require('../config/db');
const emailService = require('../services/emailService');

// Get all agents with optional search and status filter
exports.getAgents = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = db('users').where({ role: 'agent' });

    if (status && status !== 'all') {
      query = query.where({ status });
    }

    if (search) {
      query = query.andWhere((qb) => {
        qb.where('name', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`);
      });
    }

    // Sort by id desc
    query = query.orderBy('id', 'desc');

    const agents = await query;
    res.status(200).json(agents);
  } catch (error) {
    console.error('Fetch Agents Error:', error);
    res.status(500).json({ message: 'Server error fetching agents', error: error.message });
  }
};

// Create a new agent
exports.createAgent = async (req, res) => {
  try {
    const { name, email, phone, password, status, logo_url, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const [userId] = await db('users').insert({
      name,
      email,
      phone,
      password, // Plaintext as requested
      role: 'agent',
      status: status || 'active',
      logo_url: logo_url || null,
      address: address || null
    });

    const newAgent = await db('users').where({ id: userId }).first();
    delete newAgent.password;

    // Send Welcome Email
    console.log(`[Email Debug] Attempting to send Welcome Email to ${email}...`);
    const emailSent = await emailService.sendAgentWelcomeEmail(email, name, password);
    if (emailSent) {
      console.log(`[Email Debug] SUCCESS: Welcome email sent to ${email}`);
    } else {
      console.log(`[Email Debug] FAILED: Could not send welcome email to ${email}`);
    }

    res.status(201).json({ message: 'Agent created successfully', agent: newAgent });
  } catch (error) {
    console.error('Create Agent Error:', error);
    res.status(500).json({ message: 'Server error creating agent', error: error.message });
  }
};

// Update an agent
exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, logo_url, address } = req.body;

    const agent = await db('users').where({ id, role: 'agent' }).first();
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const newStatus = status || agent.status;

    await db('users').where({ id }).update({
      name: name || agent.name,
      email: email || agent.email,
      phone: phone || agent.phone,
      status: newStatus,
      logo_url: logo_url !== undefined ? logo_url : agent.logo_url,
      address: address !== undefined ? address : agent.address
    });

    const updatedAgent = await db('users').where({ id }).first();
    delete updatedAgent.password;

    // If status changed, send notification email
    if (status && status !== agent.status) {
      console.log(`[Email Debug] Status changed for ${updatedAgent.email} from ${agent.status} to ${newStatus}. Attempting to send email...`);
      const emailSent = await emailService.sendAgentStatusChangeEmail(updatedAgent.email, updatedAgent.name, newStatus);
      if (emailSent) {
        console.log(`[Email Debug] SUCCESS: Status email sent to ${updatedAgent.email}`);
      } else {
        console.log(`[Email Debug] FAILED: Could not send status email to ${updatedAgent.email}`);
      }
    } else {
      console.log(`[Email Debug] No status change detected. Old: ${agent.status}, New: ${status}`);
    }

    res.status(200).json({ message: 'Agent updated successfully', agent: updatedAgent });
  } catch (error) {
    console.error('Update Agent Error:', error);
    res.status(500).json({ message: 'Server error updating agent', error: error.message });
  }
};

// Delete an agent
exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await db('users').where({ id, role: 'agent' }).first();
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await db('users').where({ id }).del();

    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete Agent Error:', error);
    res.status(500).json({ message: 'Server error deleting agent', error: error.message });
  }
};
