"""
Verseora Database Seeding Utility
Populates sample poets, classical & modern Shayari, poems, collections, and comments.
"""
import sys
import os

# Ensure apps/api is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User, Profile, UserRole
from app.models.post import Post, Tag, PostVersion
from app.models.social import Like, Bookmark, Comment, Follow
from app.models.collection import Collection, CollectionItem
from app.core.security import get_password_hash
from datetime import datetime, timezone, timedelta

def seed():
    print("Creating tables if not exists...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.username == "verse_admin").first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding users & creators...")
        admin = User(
            username="verse_admin",
            email="admin@verseora.io",
            hashed_password=get_password_hash("AdminMasterPass123!"),
            full_name="Chief Literary Curator",
            bio="Guardian of words and poetry on Verseora.",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        db.flush()
        db.add(Profile(user_id=admin.id, pen_name="Editor-in-Chief", theme_preference="midnight"))

        # Creator 1: Kabir
        poet_kabir = User(
            username="kabir_bani",
            email="kabir@verseora.io",
            hashed_password=get_password_hash("PoetPass123!"),
            full_name="संत कबीर",
            bio="शब्द संभारे बोलिए, शब्द के हाथ न पाँव। एक शब्द औषधि करे, एक शब्द करे घाव।",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        db.add(poet_kabir)
        db.flush()
        db.add(Profile(user_id=poet_kabir.id, pen_name="कबीर", theme_preference="parchment"))

        # Creator 2: Ghalib
        poet_ghalib = User(
            username="mirza_ghalib",
            email="ghalib@verseora.io",
            hashed_password=get_password_hash("PoetPass123!"),
            full_name="Mirza Asadullah Khan Ghalib",
            bio="Hazaaron khwahishen aisi ke har khwahish pe dam nikle,\nBahut nikle mere armaan lekin phir bhi kam nikle.",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        db.add(poet_ghalib)
        db.flush()
        db.add(Profile(user_id=poet_ghalib.id, pen_name="ग़ालिब", theme_preference="midnight"))

        # Creator 3: Emily (English Poetry)
        poet_emily = User(
            username="emily_solitude",
            email="emily@verseora.io",
            hashed_password=get_password_hash("PoetPass123!"),
            full_name="Emily Vance",
            bio="Searching for quiet grace between the syllables of midnight rain.",
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
        )
        db.add(poet_emily)
        db.flush()
        db.add(Profile(user_id=poet_emily.id, pen_name="Aria", theme_preference="charcoal"))

        # Creator 4: Rohit (Hinglish Shayari)
        poet_rohit = User(
            username="rohit_shayari",
            email="rohit@verseora.io",
            hashed_password=get_password_hash("PoetPass123!"),
            full_name="Rohit Verma",
            bio="Kuch baatein lafzon me bayaan nahi hoti, bas shayari ban jaati hain.",
            role=UserRole.USER,
            is_active=True,
            is_verified=False,
        )
        db.add(poet_rohit)
        db.flush()
        db.add(Profile(user_id=poet_rohit.id, pen_name="अल्फ़ाज़", theme_preference="midnight"))

        db.commit()

        print("Seeding literary works...")
        sample_posts = [
            {
                "author": poet_ghalib,
                "title": "दिल ही तो है न संग-ओ-ख़िश्त",
                "slug": "dil-hi-to-hai-na-sang-o-khisht-a8f1b2",
                "content": "<p>दिल ही तो है न संग-ओ-ख़िश्त दर्द से भर न आए क्यों<br/>रोएँगे हम हज़ार बार कोई हमें सताए क्यों</p><p>दैर नहीं हरम नहीं दर नहीं आस्ताँ नहीं<br/>बैठे हैं रहगुज़र पे हम ग़ैर हमें उठाए क्यों</p><p>क़ैद-ए-हयात-ओ-बंद-ए-ग़म अस्ल में दोनों एक हैं<br/>मौत से पहले आदमी ग़म से नजात पाए क्यों</p>",
                "excerpt": "दिल ही तो है न संग-ओ-ख़िश्त दर्द से भर न आए क्यों, रोएँगे हम हज़ार बार कोई हमें सताए क्यों...",
                "content_type": "shayari",
                "language": "hindi",
                "status": "published",
                "visibility": "public",
                "mood": "heartbreak",
                "tags": ["ghazal", "dard", "ishq", "classic"],
                "likes": 24,
                "bookmarks": 12,
            },
            {
                "author": poet_kabir,
                "title": "मन न रंगाए, रंगाए जोगी कपड़ा",
                "slug": "man-na-rangaye-rangaye-jogi-kapda-c93d14",
                "content": "<p>मन न रंगाए, रंगाए जोगी कपड़ा।<br/>आसन मारि मंदिर में बैठे, नाम छाड़ि पूजन लागे पथरा।</p><p>कनवा फड़ाय जोगी जटवा बढ़ौले, दाढ़ी बढ़ाय जोगी होई गैले बकरा।<br/>जंगल जाइ जोगी धूनिया रमौले, काम जराय जोगी बन गैले हिजड़ा।</p><p>कहत कबीर सुनो भाई साधो, अमर लोक पावे सांचा मनवा।</p>",
                "excerpt": "मन न रंगाए, रंगाए जोगी कपड़ा। आसन मारि मंदिर में बैठे, नाम छाड़ि पूजन लागे पथरा...",
                "content_type": "poem",
                "language": "hindi",
                "status": "published",
                "visibility": "public",
                "mood": "spirituality",
                "tags": ["doha", "kabir", "santbani", "truth"],
                "likes": 38,
                "bookmarks": 19,
            },
            {
                "author": poet_emily,
                "title": "Constellations in a Paper Cup",
                "slug": "constellations-in-a-paper-cup-e45f91",
                "content": "<p>We pour the midnight into ceramic doubts,<br/>counting the cracks along the rim of dawn.<br/>A whisper travels farther than a shout,<br/>when all the bustling crowds are gone.</p><p>Be gentle with the quiet things you keep,<br/>the poems written only for the lamp.<br/>The deepest rivers never rush to sleep,<br/>they carve their cathedral in the damp.</p>",
                "excerpt": "We pour the midnight into ceramic doubts, counting the cracks along the rim of dawn...",
                "content_type": "poem",
                "language": "english",
                "status": "published",
                "visibility": "public",
                "mood": "silence",
                "tags": ["night", "solitude", "verse", "peace"],
                "likes": 17,
                "bookmarks": 8,
            },
            {
                "author": poet_rohit,
                "title": "Chai Aur Purani Yaadein",
                "slug": "chai-aur-purani-yaadein-b12a77",
                "content": "<p>Shaam dhalte hi ek pyali chai mangwayi,<br/>aur khidki par wahi purani baat yaad aayi.</p><p>Woh hansi jo be-vajah khil jaati thi,<br/>woh raahein jo anjaane mod pe mil jaati thin.<br/>Ab to waqt ki dor itni ulajh gayi hai,<br/>ke khud se milne ke liye bhi fursat nahi milti.</p>",
                "excerpt": "Shaam dhalte hi ek pyali chai mangwayi, aur khidki par wahi purani baat yaad aayi...",
                "content_type": "shayari",
                "language": "hinglish",
                "status": "published",
                "visibility": "public",
                "mood": "life",
                "tags": ["chai", "nostalgia", "yaadein", "zindagi"],
                "likes": 29,
                "bookmarks": 14,
            },
            {
                "author": poet_ghalib,
                "title": "Nuskha-e-Sukoon (Private Draft)",
                "slug": "nuskha-e-sukoon-private-f55a10",
                "content": "<p>Unfinished lines composed during insomnia. Keep private.</p>",
                "excerpt": "Unfinished lines composed during insomnia...",
                "content_type": "reflection",
                "language": "hindi",
                "status": "draft",
                "visibility": "private",  # Strictly private draft
                "mood": "silence",
                "tags": ["personal"],
                "likes": 0,
                "bookmarks": 0,
            }
        ]

        created_posts = []
        for post_data in sample_posts:
            post = Post(
                author_id=post_data["author"].id,
                title=post_data["title"],
                slug=post_data["slug"],
                content=post_data["content"],
                excerpt=post_data["excerpt"],
                content_type=post_data["content_type"],
                language=post_data["language"],
                status=post_data["status"],
                visibility=post_data["visibility"],
                mood=post_data["mood"],
                likes_count=post_data["likes"],
                bookmarks_count=post_data["bookmarks"],
                published_at=datetime.now(timezone.utc) if post_data["status"] == "published" else None,
            )
            for t_name in post_data["tags"]:
                tag = db.query(Tag).filter(Tag.name == t_name).first()
                if not tag:
                    tag = Tag(name=t_name, slug=t_name)
                    db.add(tag)
                post.tags.append(tag)

            db.add(post)
            db.flush()

            # Version
            db.add(PostVersion(post_id=post.id, title=post.title, content=post.content, version_number=1))
            created_posts.append(post)

        db.commit()

        print("Seeding collections & social connections...")
        # Follow relationships
        db.add(Follow(follower_id=poet_rohit.id, following_id=poet_ghalib.id))
        db.add(Follow(follower_id=poet_emily.id, following_id=poet_kabir.id))
        db.add(Follow(follower_id=poet_rohit.id, following_id=poet_emily.id))

        # Sample collection
        collection = Collection(
            user_id=poet_ghalib.id,
            name="ग़ज़ल-ए-शाम",
            description="A curated evening collection of timeless Urdu & Hindi couplets.",
            is_public=True
        )
        db.add(collection)
        db.flush()
        db.add(CollectionItem(collection_id=collection.id, post_id=created_posts[0].id))

        # Sample comments
        db.add(Comment(
            post_id=created_posts[0].id,
            author_id=poet_rohit.id,
            content="Ghalib sahab ke har sher me zindagi ka ek alag hi dhang hai. Bemisaal!"
        ))
        db.add(Comment(
            post_id=created_posts[2].id,
            author_id=poet_ghalib.id,
            content="The stillness in these lines is profound. Beautifully composed."
        ))

        db.commit()
        print("Database successfully seeded with authentic poetry and sample creators!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()

