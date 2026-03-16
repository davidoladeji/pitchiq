/**
 * Inline-CSS HTML email templates for PitchIQ notifications.
 */

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#0a0a2e;padding:24px 32px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">PitchIQ</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;">
          <p style="margin:0;font-size:11px;color:#999;text-align:center;">
            &copy; ${new Date().getFullYear()} PitchIQ. You received this because you own a deck on PitchIQ.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function highEngagementAlert(params: {
  deckTitle: string;
  totalTimeSeconds: number;
  deckShareId: string;
  appUrl: string;
}): string {
  const minutes = Math.round(params.totalTimeSeconds / 60);
  const deckUrl = `${params.appUrl}/deck/${params.deckShareId}`;
  const dashboardUrl = `${params.appUrl}/dashboard`;

  return layout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#0a0a2e;">Someone is engaged with your deck</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
      A viewer spent <strong style="color:#0a0a2e;">${minutes} minute${minutes !== 1 ? "s" : ""}</strong>
      reviewing your pitch deck:
    </p>
    <div style="background:#f8f8fc;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0;font-size:16px;font-weight:600;color:#0a0a2e;">${params.deckTitle}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#888;">${minutes}+ min engagement</p>
    </div>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
      High engagement like this often signals serious investor interest. Consider following up.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr>
        <td style="padding-right:8px;">
          <a href="${dashboardUrl}" style="display:inline-block;padding:10px 20px;background:#4361ee;color:#fff;font-size:13px;font-weight:600;border-radius:8px;text-decoration:none;">
            View Dashboard
          </a>
        </td>
        <td>
          <a href="${deckUrl}" style="display:inline-block;padding:10px 20px;background:#f0f0f5;color:#0a0a2e;font-size:13px;font-weight:600;border-radius:8px;text-decoration:none;">
            View Deck
          </a>
        </td>
      </tr>
    </table>
  `);
}

export function workspaceInvite(params: {
  workspaceName: string;
  inviterName: string;
  role: string;
  joinUrl: string;
}): string {
  return layout(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#0a0a2e;">You're invited to a workspace</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
      <strong style="color:#0a0a2e;">${params.inviterName}</strong> invited you to join
      <strong style="color:#0a0a2e;">${params.workspaceName}</strong> as ${params.role === "editor" ? "an" : "a"} <strong>${params.role}</strong>.
    </p>
    <a href="${params.joinUrl}" style="display:inline-block;padding:12px 28px;background:#4361ee;color:#fff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
      Accept Invitation
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#999;">
      This invitation expires in 7 days. If you didn't expect this, you can ignore it.
    </p>
  `);
}
