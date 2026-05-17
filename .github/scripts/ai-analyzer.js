// Script tambahan untuk analisis lebih mendalam
module.exports = async ({ github, context, core }) => {
  const { data: pr } = await github.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number
  });
  
  // Deteksi jenis masalah
  const issues = [];
  
  if (pr.mergeable === false) {
    issues.push('merge_conflict');
    
    // Ambil file yang konflik
    const { data: files } = await github.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.issue.number
    });
    
    const conflictFiles = files.filter(f => f.status === 'modified' && 
      (f.patch?.includes('<<<<<<<') || f.patch?.includes('>>>>>>>')));
    
    core.setOutput('conflict_files', JSON.stringify(conflictFiles.map(f => f.filename)));
  }
  
  // Cek linting/syntax error dari logs
  const { data: runs } = await github.rest.actions.listWorkflowRuns({
    owner: context.repo.owner,
    repo: context.repo.repo,
    branch: pr.head.ref,
    status: 'failure',
    per_page: 1
  });
  
  if (runs.workflow_runs.length > 0) {
    const { data: jobs } = await github.rest.actions.listJobsForWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: runs.workflow_runs[0].id
    });
    
    const errorLogs = jobs.jobs.filter(j => j.conclusion === 'failure')
      .map(j => j.name);
    
    core.setOutput('error_logs', JSON.stringify(errorLogs));
  }
  
  core.setOutput('issue_types', JSON.stringify(issues));
};