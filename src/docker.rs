use anyhow::Result;
use bollard::{self, image::BuildImageOptions, Docker};

// pub async fn build_image(docker: Docker, dockerfile: String) -> Result<()> {
//     let mut header = tar::Header::new_gnu();
//     header.set_path("Dockerfile")?;
//     header.set_size(dockerfile.len() as u64);
//     header.set_mode(0o755);
//     header.set_cksum();
//     let mut tar = tar::Builder::new(Vec::new());
//     tar.append(&header, dockerfile.as_bytes())?;
//
//     let uncompressed = tar.into_inner()?;
//     let mut c = flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::default());
//     c.write_all(&uncompressed)?;
//     let compressed = c.finish()?;
//
//     // TODO: finish this https://github.com/fussybeaver/bollard/blob/master/examples/build_buildkit.rs
//
//     Ok(())
// }
