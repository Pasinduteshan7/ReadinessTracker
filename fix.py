
import os
base_dir = 'd:/PROJECTS/PERSONAL/group/EMPLOYABILITY READINESS TRACKER/Readiness tracker/readiness-tracker-backend/src/main/java/com/example/readinesstrackerbackend/entity'
for filename in ['ChallengeSubmission.java', 'ProblemAssignment.java', 'BenchmarkAnalysisResult.java']:
    path = os.path.join(base_dir, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f: content = f.read()
        content = content.replace('private Long userId;', 'private Long studentId;')
        content = content.replace('user_id', 'student_id')
        with open(path, 'w', encoding='utf-8') as f: f.write(content)
print('Entities updated!')

