const { getUser, admin } = require('../lib/supabase');

// GET /api/credits            -> balance snapshot
// GET /api/credits?history=1  -> + last 50 ledger entries (transaction history)
module.exports = async (req, res) => {
  try {
    const u = await getUser(req);
    if (!u) return res.status(401).json({ error: 'Sign in required' });
    const sb = admin();
    const { data, error } = await sb
      .from('profiles')
      .select('plan,monthly_grant,credits_monthly,credits_paid,credits_bonus,stars,lifetime_level,monthly_level')
      .eq('id', u.id)
      .single();
    if (error) throw error;
    const out = {
      plan: data.plan,
      monthly_grant: data.monthly_grant,
      total: (data.credits_monthly || 0) + (data.credits_paid || 0) + (data.credits_bonus || 0),
      ...data
    };
    const wantHistory = req.query && (req.query.history === '1' || req.query.history === 'true');
    if (wantHistory) {
      const { data: ledger, error: le } = await sb
        .from('credit_ledger')
        .select('delta,bucket,reason,created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (le) throw le;
      out.ledger = ledger || [];
    }
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
