// About / project description page for ChineseOracleRoots.
// Frames the app as a Georgia Tech CS6795 Cognitive Science project.

export default function AboutView() {
  return (
    <div className="card about">
      <h2 style={{ color: 'var(--accent)', marginTop: 0 }}>About this project</h2>

      <p>
        <strong>ChineseOracleRoots</strong> is a cognitive science project for{' '}
        <strong>Georgia Institute of Technology — CS 6795 Cognitive Science</strong>.
        It pairs an exploratory tool with a small learning experiment to study how the
        mind builds abstract symbols from concrete pictures.
      </p>

      <h3>The idea</h3>
      <p>
        Oracle bone script (甲骨文), the earliest attested Chinese writing, is largely
        pictographic — many characters began as little drawings of the things they name
        (山 a mountain, 目 an eye, 馬 a horse). Over three thousand years those pictures
        were abstracted into today's symbolic glyphs. The app visualizes that
        <em> perception-to-symbol</em> transition, one of the central themes in the
        computational-representational understanding of mind.
      </p>

      <h3>The research question</h3>
      <p>
        Does seeing a character's <em>pictographic origin</em> help people learn and
        remember its meaning better than seeing the meaning alone? The study is grounded
        in <strong>dual coding theory</strong> (pairing a verbal meaning with a visual
        code aids memory) and <strong>depth-of-processing / elaborative encoding</strong>
        (a meaningful origin "story" gives richer, more memorable encoding).
      </p>

      <h3>How the study works</h3>
      <ul>
        <li>
          <strong>Explore</strong> lets you look up any curated character and see its
          oracle bone form, meaning, and pictographic origin.
        </li>
        <li>
          <strong>Learning Study</strong> randomly assigns you to one of two study
          formats — <em>with</em> the pictographic origin, or the <em>meaning only</em> —
          then quizzes you. Comparing scores across the two groups tests the hypothesis.
        </li>
        <li>
          The study is anonymous: a random per-session ID is generated in your browser,
          and no personal information is collected. You can download your own result as
          a JSON file.
        </li>
      </ul>

      <h3>Data &amp; credits</h3>
      <ul>
        <li>
          Oracle bone images: <strong>HUST-OBC</strong> dataset (Wang et al., <em>An open
          dataset for oracle bone character recognition and decipherment</em>, Scientific
          Data, 2024; CC BY 4.0).
        </li>
        <li>English glosses adapted from <strong>CC-CEDICT</strong> (CC BY-SA 3.0).</li>
        <li>Character etymologies synthesised from standard references.</li>
      </ul>

      <p className="hint" style={{ marginTop: 20 }}>
        Created by <strong>Gan Li</strong> ·{' '}
        <a
          href="https://github.com/williamgl/ChineseOracleRoots"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/williamgl/ChineseOracleRoots
        </a>
      </p>
    </div>
  )
}
